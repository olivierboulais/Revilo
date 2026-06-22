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
  connected_at: string;
}

export async function upsertSource(
  userId: string,
  provider: "figma" | "github",
  accessToken: string,
  refreshToken: string | null,
  externalName: string | null = null
): Promise<void> {
  const db = await getDb();
  // ON CONFLICT works the same way in both SQLite and Postgres for this
  // simple case, since the (user_id, provider) unique constraint already
  // exists in the schema.
  await db.run(
    `INSERT INTO sources (id, user_id, provider, status, access_token, refresh_token, external_name)
     VALUES (?, ?, ?, 'connected', ?, ?, ?)
     ON CONFLICT(user_id, provider) DO UPDATE SET
       status = 'connected', access_token = excluded.access_token,
       refresh_token = excluded.refresh_token, external_name = excluded.external_name`,
    [randomUUID(), userId, provider, accessToken, refreshToken, externalName]
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

export async function updateSourceToken(userId: string, provider: "figma" | "github", accessToken: string): Promise<void> {
  const db = await getDb();
  await db.run(
    "UPDATE sources SET access_token = ? WHERE user_id = ? AND provider = ?",
    [accessToken, userId, provider]
  );
}

export async function disconnectSource(userId: string, provider: "figma" | "github"): Promise<void> {
  const db = await getDb();
  await db.run(
    "UPDATE sources SET status = 'disconnected', access_token = NULL, refresh_token = NULL WHERE user_id = ? AND provider = ?",
    [userId, provider]
  );
}
