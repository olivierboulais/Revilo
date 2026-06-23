import { getDb } from "@/lib/db/client";
import { randomUUID, randomBytes } from "crypto";

const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 30; // 30 days

export interface SessionRecord {
  id: string;
  session_token: string;
  user_id: string;
  expires_at: string;
}

export async function createDbSession(userId: string): Promise<string> {
  const db = await getDb();
  const id = randomUUID();
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS).toISOString();
  await db.run(
    "INSERT INTO sessions (id, session_token, user_id, expires_at) VALUES (?, ?, ?, ?)",
    [id, token, userId, expiresAt]
  );
  return token;
}

export async function findSessionByToken(token: string): Promise<SessionRecord | null> {
  const db = await getDb();
  const result = await db.query<SessionRecord>(
    "SELECT * FROM sessions WHERE session_token = ? AND expires_at > ?",
    [token, new Date().toISOString()]
  );
  return result.rows[0] ?? null;
}

export async function deleteSessionByToken(token: string): Promise<void> {
  const db = await getDb();
  await db.run("DELETE FROM sessions WHERE session_token = ?", [token]);
}

// Swap point: in production, run this on a schedule (cron, or a Postgres
// scheduled job) rather than relying on it being called manually.
export async function deleteExpiredSessions(): Promise<number> {
  const db = await getDb();
  const result = await db.run("DELETE FROM sessions WHERE expires_at <= ?", [new Date().toISOString()]);
  return result.changes;
}
