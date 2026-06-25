import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { findUserByEmail } from "@/lib/db/users";
import { getSource, parseFigmaFiles } from "@/lib/db/sources";
import { fetchFigmaComponents, fetchFigmaTokens, fetchFigmaUsageSignals } from "@/lib/figma/api";
import { fetchGithubComponents, fetchGithubTokens } from "@/lib/github/api";

export const maxDuration = 60;

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const user = await findUserByEmail(session.email);
  if (!user) return NextResponse.json({ error: "No user" }, { status: 404 });

  const figmaSource = await getSource(user.id, "figma");
  const githubSource = await getSource(user.id, "github");

  const figmaFiles = parseFigmaFiles(figmaSource?.figma_file_key ?? null);

  const result: Record<string, unknown> = {
    figmaConnected: figmaSource?.status === "connected",
    figmaHasToken: Boolean(figmaSource?.access_token),
    figmaFiles,
    githubConnected: githubSource?.status === "connected",
    githubHasToken: Boolean(githubSource?.access_token),
    githubRepo: githubSource?.github_repo,
  };

  // Try fetching Figma data from each file
  if (figmaSource?.status === "connected" && figmaSource.access_token && figmaFiles.length > 0) {
    const fileResults = [];
    for (const file of figmaFiles) {
      try {
        const components = await fetchFigmaComponents(
          user.id, file.key, figmaSource.access_token,
          figmaSource.refresh_token, figmaSource.token_expires_at
        );
        const tokens = await fetchFigmaTokens(
          user.id, file.key, figmaSource.access_token,
          figmaSource.refresh_token, figmaSource.token_expires_at
        );
        const signals = await fetchFigmaUsageSignals(
          user.id, file.key, figmaSource.access_token,
          figmaSource.refresh_token, figmaSource.token_expires_at
        );
        fileResults.push({
          fileKey: file.key,
          role: file.role,
          label: file.label,
          componentCount: components.length,
          componentNames: components.slice(0, 10).map(c => c.name),
          tokenCount: tokens.length,
          tokenSample: tokens.slice(0, 10).map(t => ({ name: t.name, value: t.value, category: t.category })),
          signalCount: signals.length,
          signalSample: signals.slice(0, 5),
        });
      } catch (err) {
        fileResults.push({
          fileKey: file.key,
          role: file.role,
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }
    result.figmaResults = fileResults;
  }

  // Try fetching GitHub data — with detailed diagnostics
  if (githubSource?.status === "connected" && githubSource.access_token && githubSource.github_repo) {
    const repo = githubSource.github_repo;
    const token = githubSource.access_token;
    const [owner, repoName] = repo.split("/");

    // Step 1: Test raw tree API
    try {
      const treeRes = await fetch(`https://api.github.com/repos/${owner}/${repoName}/git/trees/HEAD?recursive=1`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
        },
        signal: AbortSignal.timeout(30_000),
      });
      const treeStatus = treeRes.status;
      const treeRedirected = treeRes.redirected;
      const treeUrl = treeRes.url;

      if (treeRes.ok) {
        const treeData = await treeRes.json();
        const allItems = treeData.tree || [];
        const truncated = treeData.truncated;
        const tsxFiles = allItems.filter((i: { type: string; path: string }) => i.type === "blob" && /\.(tsx|jsx)$/.test(i.path));
        const componentLike = tsxFiles.filter((i: { path: string }) => {
          const name = i.path.split("/").pop()?.replace(/\.(tsx|jsx)$/, "") ?? "";
          return /^[A-Z][a-zA-Z0-9]+$/.test(name) && !/\.(test|spec|stories)\./.test(i.path) && !/\/index\./.test(i.path);
        });
        result.githubTreeDiag = {
          status: treeStatus,
          redirected: treeRedirected,
          finalUrl: treeUrl,
          truncated,
          totalItems: allItems.length,
          tsxFiles: tsxFiles.length,
          componentLikeFiles: componentLike.length,
          samplePaths: componentLike.slice(0, 10).map((i: { path: string }) => i.path),
        };
      } else {
        const body = await treeRes.text().catch(() => "");
        result.githubTreeDiag = { status: treeStatus, redirected: treeRedirected, finalUrl: treeUrl, error: body };
      }
    } catch (err) {
      result.githubTreeDiag = { error: err instanceof Error ? err.message : String(err) };
    }

    // Step 2: Test Contents API
    try {
      const contentsRes = await fetch(`https://api.github.com/repos/${owner}/${repoName}/contents/`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
        },
        signal: AbortSignal.timeout(15_000),
      });
      result.githubContentsDiag = {
        status: contentsRes.status,
        redirected: contentsRes.redirected,
        finalUrl: contentsRes.url,
      };
      if (contentsRes.ok) {
        const items = await contentsRes.json();
        result.githubContentsDiag = {
          ...result.githubContentsDiag as object,
          itemCount: items.length,
          dirs: items.filter((i: { type: string }) => i.type === "dir").map((i: { name: string }) => i.name),
        };
      }
    } catch (err) {
      result.githubContentsDiag = { error: err instanceof Error ? err.message : String(err) };
    }

    // Step 3: Try the full scanner
    try {
      const components = await fetchGithubComponents(repo, token);
      const tokens = await fetchGithubTokens(repo, token);
      result.githubComponents = {
        count: components.length,
        names: components.slice(0, 15).map(c => ({ name: c.name, path: c.path, variants: c.variants.slice(0, 5) })),
      };
      result.githubTokens = {
        count: tokens.length,
        sample: tokens.slice(0, 15).map(t => ({ name: t.name, value: t.value, category: t.category })),
      };
    } catch (err) {
      result.githubError = err instanceof Error ? err.message : String(err);
    }
  }

  return NextResponse.json(result, { status: 200 });
}
