import { randomUUID, randomBytes } from "crypto";
import { getSupabaseClient, isSupabase } from "@/lib/db/supabase";
import { getDb } from "@/lib/db/client";

const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 30; // 30 days

export interface SessionRecord {
  id: string;
  session_token: string;
  user_id: string;
  expires_at: string;
}

async function sb() { return getSupabaseClient(); }
async function db() { return getDb(); }

export async function createDbSession(userId: string): Promise<string> {
  const id = randomUUID();
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS).toISOString();
  if (isSupabase()) {
    await (await sb()).from("sessions").insert({ id, session_token: token, user_id: userId, expires_at: expiresAt });
    return token;
  }
  await (await db()).run(
    "INSERT INTO sessions (id, session_token, user_id, expires_at) VALUES (?, ?, ?, ?)",
    [id, token, userId, expiresAt]
  );
  return token;
}

export async function findSessionByToken(token: string): Promise<SessionRecord | null> {
  const now = new Date().toISOString();
  if (isSupabase()) {
    const { data } = await (await sb())
      .from("sessions").select("*")
      .eq("session_token", token).gt("expires_at", now).maybeSingle();
    return data ?? null;
  }
  const result = await (await db()).query<SessionRecord>(
    "SELECT * FROM sessions WHERE session_token = ? AND expires_at > ?",
    [token, now]
  );
  return result.rows[0] ?? null;
}

export async function deleteSessionByToken(token: string): Promise<void> {
  if (isSupabase()) {
    await (await sb()).from("sessions").delete().eq("session_token", token);
    return;
  }
  await (await db()).run("DELETE FROM sessions WHERE session_token = ?", [token]);
}

export async function deleteExpiredSessions(): Promise<number> {
  const now = new Date().toISOString();
  if (isSupabase()) {
    const { count } = await (await sb()).from("sessions").delete({ count: "exact" }).lte("expires_at", now);
    return count ?? 0;
  }
  const result = await (await db()).run("DELETE FROM sessions WHERE expires_at <= ?", [now]);
  return result.changes;
}
