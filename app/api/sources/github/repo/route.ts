import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { findUserByEmail } from "@/lib/db/users";
import { updateGithubRepo } from "@/lib/db/sources";

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

  await updateGithubRepo(user.id, repo);
  return NextResponse.json({ ok: true, repo });
}
