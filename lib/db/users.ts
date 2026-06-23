import { randomUUID } from "crypto";
import { getSupabaseClient, isSupabase } from "@/lib/db/supabase";
import { getDb } from "@/lib/db/client";

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

async function sb() { return getSupabaseClient(); }
async function db() { return getDb(); }

export async function findUserByEmail(email: string): Promise<UserRecord | null> {
  const normalized = email.toLowerCase().trim();
  if (isSupabase()) {
    const { data } = await (await sb()).from("users").select("*").eq("email", normalized).maybeSingle();
    return data ?? null;
  }
  const result = await (await db()).query<UserRecord>("SELECT * FROM users WHERE email = ?", [normalized]);
  return result.rows[0] ?? null;
}

export async function findUserById(id: string): Promise<UserRecord | null> {
  if (isSupabase()) {
    const { data } = await (await sb()).from("users").select("*").eq("id", id).maybeSingle();
    return data ?? null;
  }
  const result = await (await db()).query<UserRecord>("SELECT * FROM users WHERE id = ?", [id]);
  return result.rows[0] ?? null;
}

export async function createUser(email: string, passwordHash: string, workspaceName: string): Promise<UserRecord> {
  const id = randomUUID();
  const normalized = email.toLowerCase().trim();
  const now = new Date().toISOString();
  if (isSupabase()) {
    const { data, error } = await (await sb()).from("users").insert({
      id, email: normalized, password_hash: passwordHash, workspace_name: workspaceName,
      tier: "free", created_at: now, updated_at: now,
    }).select("*").single();
    if (error) throw new Error(error.message);
    return data as UserRecord;
  }
  await (await db()).run(
    "INSERT INTO users (id, email, password_hash, workspace_name) VALUES (?, ?, ?, ?)",
    [id, normalized, passwordHash, workspaceName]
  );
  const user = await findUserById(id);
  if (!user) throw new Error("Failed to create user");
  return user;
}

export async function updateUserTier(userId: string, tier: "free" | "pro" | "monitoring"): Promise<void> {
  if (isSupabase()) {
    await (await sb()).from("users").update({ tier, updated_at: new Date().toISOString() }).eq("id", userId);
    return;
  }
  await (await db()).run("UPDATE users SET tier = ?, updated_at = ? WHERE id = ?", [tier, new Date().toISOString(), userId]);
}

export async function markEmailVerified(userId: string): Promise<void> {
  const now = new Date().toISOString();
  if (isSupabase()) {
    await (await sb()).from("users").update({ email_verified_at: now }).eq("id", userId);
    return;
  }
  await (await db()).run("UPDATE users SET email_verified_at = ? WHERE id = ?", [now, userId]);
}

export async function updateWorkspaceName(userId: string, name: string): Promise<void> {
  const now = new Date().toISOString();
  if (isSupabase()) {
    await (await sb()).from("users").update({ workspace_name: name, updated_at: now }).eq("id", userId);
    return;
  }
  await (await db()).run("UPDATE users SET workspace_name = ?, updated_at = ? WHERE id = ?", [name, now, userId]);
}

export async function updatePasswordHash(userId: string, passwordHash: string): Promise<void> {
  const now = new Date().toISOString();
  if (isSupabase()) {
    await (await sb()).from("users").update({ password_hash: passwordHash, updated_at: now }).eq("id", userId);
    return;
  }
  await (await db()).run("UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?", [passwordHash, now, userId]);
}

export async function getUsersByTier(tier: "free" | "pro" | "monitoring"): Promise<UserRecord[]> {
  if (isSupabase()) {
    const { data } = await (await sb()).from("users").select("*").eq("tier", tier);
    return (data ?? []) as UserRecord[];
  }
  const result = await (await db()).query<UserRecord>("SELECT * FROM users WHERE tier = ?", [tier]);
  return result.rows;
}

export async function deleteUser(userId: string): Promise<void> {
  if (isSupabase()) {
    await (await sb()).from("users").delete().eq("id", userId);
    return;
  }
  await (await db()).run("DELETE FROM users WHERE id = ?", [userId]);
}
