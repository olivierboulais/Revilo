import { randomUUID, randomBytes } from "crypto";
import { getSupabaseClient, isSupabase } from "@/lib/db/supabase";
import { getDb } from "@/lib/db/client";

export interface VerificationToken {
  id: string;
  token: string;
  purpose: "email_verify" | "password_reset";
  user_id: string;
  expires_at: string;
  created_at: string;
}

async function sb() { return getSupabaseClient(); }
async function db() { return getDb(); }

export async function createVerificationToken(
  userId: string,
  purpose: "email_verify" | "password_reset",
  expiresInSeconds = 86400
): Promise<string> {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + expiresInSeconds * 1000).toISOString();
  const now = new Date().toISOString();
  if (isSupabase()) {
    await (await sb()).from("verification_tokens").insert({
      id: randomUUID(), token, purpose, user_id: userId, expires_at: expiresAt, created_at: now,
    });
    return token;
  }
  await (await db()).run(
    "INSERT INTO verification_tokens (id, token, purpose, user_id, expires_at) VALUES (?, ?, ?, ?, ?)",
    [randomUUID(), token, purpose, userId, expiresAt]
  );
  return token;
}

export async function findVerificationToken(
  token: string,
  purpose: "email_verify" | "password_reset"
): Promise<VerificationToken | null> {
  const now = new Date().toISOString();
  if (isSupabase()) {
    const { data } = await (await sb())
      .from("verification_tokens").select("*")
      .eq("token", token).eq("purpose", purpose).gt("expires_at", now).maybeSingle();
    return data ?? null;
  }
  const result = await (await db()).query<VerificationToken>(
    "SELECT * FROM verification_tokens WHERE token = ? AND purpose = ? AND expires_at > ?",
    [token, purpose, now]
  );
  return result.rows[0] ?? null;
}

export async function deleteVerificationToken(token: string): Promise<void> {
  if (isSupabase()) {
    await (await sb()).from("verification_tokens").delete().eq("token", token);
    return;
  }
  await (await db()).run("DELETE FROM verification_tokens WHERE token = ?", [token]);
}
