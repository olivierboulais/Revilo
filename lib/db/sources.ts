import { getDb } from "@/lib/db/client";
import { randomUUID } from "crypto";

export interface SourceRecord {
  id: string;
  user_id: string;
  provider: "figma" | "github";
  status: "connected" | "disconnected" | "error";
  access_token: string | null;
  refresh_token: string | null;
  external_name: string | null;
  figma_file_key: string | null;
  github_repo: string | null;
  token_expires_at: string | null;
  connected_at: string;
}

export async function upsertSource(
  userId: string,
  provider: "figma" | "github",
  accessToken: string,
  refreshToken: string | null,
  externalName: string | null = null,
  tokenExpiresAt: string | null = null
): Promise<void> {
  const db = await getDb();
  await db.run(
    `INSERT INTO sources (id, user_id, provider, status, access_token, refresh_token, external_name, token_expires_at)
     VALUES (?, ?, ?, 'connected', ?, ?, ?, ?)
     ON CONFLICT(user_id, provider) DO UPDATE SET
       status = 'connected', access_token = excluded.access_token,
       refresh_token = excluded.refresh_token, external_name = excluded.external_name,
       token_expires_at = excluded.token_expires_at`,
    [randomUUID(), userId, provider, accessToken, refreshToken, externalName, tokenExpiresAt]
  );
}

export async function getSource(userId: string, provider: "figma" | "github"): Promise<SourceRecord | null> {
  const db = await getDb();
  const result = await db.query<SourceRecord>(
    "SELECT * FROM sources WHERE user_id = ? AND provider = ?",
    [userId, provider]
  );
  return result.rows[0] ?? null;
}

export async function updateSourceToken(
  userId: string,
  provider: "figma" | "github",
  accessToken: string,
  tokenExpiresAt: string | null = null
): Promise<void> {
  const db = await getDb();
  await db.run(
    "UPDATE sources SET access_token = ?, token_expires_at = ? WHERE user_id = ? AND provider = ?",
    [accessToken, tokenExpiresAt, userId, provider]
  );
}

export async function updateFigmaFileKey(userId: string, fileKey: string): Promise<void> {
  const db = await getDb();
  await db.run(
    "UPDATE sources SET figma_file_key = ? WHERE user_id = ? AND provider = 'figma'",
    [fileKey, userId]
  );
}

export async function updateGithubRepo(userId: string, repo: string): Promise<void> {
  const db = await getDb();
  await db.run(
    "UPDATE sources SET github_repo = ? WHERE user_id = ? AND provider = 'github'",
    [repo, userId]
  );
}

export async function disconnectSource(userId: string, provider: "figma" | "github"): Promise<void> {
  const db = await getDb();
  await db.run(
    "UPDATE sources SET status = 'disconnected', access_token = NULL, refresh_token = NULL, token_expires_at = NULL WHERE user_id = ? AND provider = ?",
    [userId, provider]
  );
}
