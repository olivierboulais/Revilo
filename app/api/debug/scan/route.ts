import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { findUserByEmail } from "@/lib/db/users";
import { getSource, parseFigmaFiles } from "@/lib/db/sources";
import { fetchFigmaComponents, fetchFigmaTokens, fetchFigmaUsageSignals } from "@/lib/figma/api";
import { fetchGithubComponents, fetchGithubTokens } from "@/lib/github/api";

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

  // Try fetching GitHub data
  if (githubSource?.status === "connected" && githubSource.access_token && githubSource.github_repo) {
    try {
      const components = await fetchGithubComponents(githubSource.github_repo, githubSource.access_token);
      const tokens = await fetchGithubTokens(githubSource.github_repo, githubSource.access_token);
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
