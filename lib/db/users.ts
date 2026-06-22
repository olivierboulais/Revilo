import { getDb } from "@/lib/db/client";
import { randomUUID } from "crypto";

export interface UserRecord {
  id: string;
  email: string;
  password_hash: string;
  email_verified_at: string | null;
  workspace_name: string;
  tier: "free" | "pro" | "monitoring";
  created_at: string;
  updated_at: string;
}

export async function findUserByEmail(email: string): Promise<UserRecord | null> {
  const db = await getDb();
  const result = await db.query<UserRecord>("SELECT * FROM users WHERE email = ?", [email.toLowerCase().trim()]);
  return result.rows[0] ?? null;
}

export async function findUserById(id: string): Promise<UserRecord | null> {
  const db = await getDb();
  const result = await db.query<UserRecord>("SELECT * FROM users WHERE id = ?", [id]);
  return result.rows[0] ?? null;
}

export async function createUser(email: string, passwordHash: string, workspaceName: string): Promise<UserRecord> {
  const db = await getDb();
  const id = randomUUID();
  const normalizedEmail = email.toLowerCase().trim();
  await db.run(
    "INSERT INTO users (id, email, password_hash, workspace_name) VALUES (?, ?, ?, ?)",
    [id, normalizedEmail, passwordHash, workspaceName]
  );
  const user = await findUserById(id);
  if (!user) throw new Error("Failed to create user");
  return user;
}

export async function updateUserTier(userId: string, tier: "free" | "pro" | "monitoring"): Promise<void> {
  const db = await getDb();
  await db.run("UPDATE users SET tier = ?, updated_at = datetime('now') WHERE id = ?", [tier, userId]);
}

export async function markEmailVerified(userId: string): Promise<void> {
  const db = await getDb();
  await db.run("UPDATE users SET email_verified_at = datetime('now') WHERE id = ?", [userId]);
}

export async function updateWorkspaceName(userId: string, name: string): Promise<void> {
  const db = await getDb();
  await db.run("UPDATE users SET workspace_name = ?, updated_at = datetime('now') WHERE id = ?", [name, userId]);
}

export async function updatePasswordHash(userId: string, passwordHash: string): Promise<void> {
  const db = await getDb();
  await db.run("UPDATE users SET password_hash = ?, updated_at = datetime('now') WHERE id = ?", [passwordHash, userId]);
}
