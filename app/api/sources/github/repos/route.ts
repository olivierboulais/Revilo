import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { findUserByEmail } from "@/lib/db/users";
import { getSource } from "@/lib/db/sources";
import { GITHUB_API_BASE } from "@/lib/github/config";

interface GhRepo {
  full_name: string;
  private: boolean;
  description: string | null;
  updated_at: string;
}

async function ghGet<T>(path: string, token: string): Promise<T> {
  const res = await fetch(`${GITHUB_API_BASE}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });
  if (!res.ok) throw new Error(`GitHub API ${path} → ${res.status}`);
  return res.json();
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await findUserByEmail(session.email);
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const source = await getSource(user.id, "github");
  if (!source?.access_token) {
    return NextResponse.json({ error: "GitHub not connected" }, { status: 400 });
  }

  const token = source.access_token;

  // Fetch repos the user has access to across all accounts (personal + orgs)
  // per_page=100 is the GitHub max; sort by updated so most recent appear first
  const repos = await ghGet<GhRepo[]>(
    "/user/repos?per_page=100&sort=updated&affiliation=owner,organization_member,collaborator",
    token
  );

  return NextResponse.json({
    repos: repos.map((r) => ({
      full_name: r.full_name,
      private: r.private,
      description: r.description,
    })),
  });
}
