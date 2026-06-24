import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { findUserByEmail } from "@/lib/db/users";
import { getSource, updateGithubRepo } from "@/lib/db/sources";
import { GITHUB_API_BASE } from "@/lib/github/config";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const repo = typeof body.repo === "string" ? body.repo.trim() : "";
  if (!repo || !/^[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+$/.test(repo)) {
    return NextResponse.json({ error: "repo must be in owner/repo format" }, { status: 400 });
  }

  const user = await findUserByEmail(session.email);
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const githubSource = await getSource(user.id, "github");
  if (!githubSource?.access_token) {
    return NextResponse.json({ error: "GitHub account not connected" }, { status: 400 });
  }

  // Verify the user actually has access to this repository
  const ghResponse = await fetch(`${GITHUB_API_BASE}/repos/${repo}`, {
    headers: {
      Authorization: `Bearer ${githubSource.access_token}`,
      Accept: "application/vnd.github+json",
    },
  });

  if (ghResponse.status === 404 || ghResponse.status === 403) {
    return NextResponse.json(
      { error: "Repository not found or you don't have access to it" },
      { status: 404 },
    );
  }

  if (!ghResponse.ok) {
    return NextResponse.json(
      { error: "Failed to verify repository access" },
      { status: 502 },
    );
  }

  await updateGithubRepo(user.id, repo);
  return NextResponse.json({ ok: true, repo });
}
