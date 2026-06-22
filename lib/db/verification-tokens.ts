import { getDb } from "@/lib/db/client";
import { randomUUID, randomBytes } from "crypto";

export interface VerificationToken {
  id: string;
  token: string;
  purpose: "email_verify" | "password_reset";
  user_id: string;
  expires_at: string;
  created_at: string;
}

export async function createVerificationToken(
  userId: string,
  purpose: "email_verify" | "password_reset",
  expiresInSeconds = 86400 // 24 hours default
): Promise<string> {
  const db = await getDb();
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + expiresInSeconds * 1000).toISOString();
  await db.run(
    "INSERT INTO verification_tokens (id, token, purpose, user_id, expires_at) VALUES (?, ?, ?, ?, ?)",
    [randomUUID(), token, purpose, userId, expiresAt]
  );
  return token;
}

export async function findVerificationToken(
  token: string,
  purpose: "email_verify" | "password_reset"
): Promise<VerificationToken | null> {
  const db = await getDb();
  const result = await db.query<VerificationToken>(
    "SELECT * FROM verification_tokens WHERE token = ? AND purpose = ? AND expires_at > datetime('now')",
    [token, purpose]
  );
  return result.rows[0] ?? null;
}

export async function deleteVerificationToken(token: string): Promise<void> {
  const db = await getDb();
  await db.run("DELETE FROM verification_tokens WHERE token = ?", [token]);
}
