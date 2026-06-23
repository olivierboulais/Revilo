import { randomUUID } from "crypto";
import { getSupabaseClient, isSupabase } from "@/lib/db/supabase";
import { getDb } from "@/lib/db/client";

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

async function sb() { return getSupabaseClient(); }
async function db() { return getDb(); }

export async function upsertSource(
  userId: string,
  provider: "figma" | "github",
  accessToken: string,
  refreshToken: string | null,
  externalName: string | null = null,
  tokenExpiresAt: string | null = null
): Promise<void> {
  if (isSupabase()) {
    await (await sb()).from("sources").upsert({
      id: randomUUID(), user_id: userId, provider, status: "connected",
      access_token: accessToken, refresh_token: refreshToken,
      external_name: externalName, token_expires_at: tokenExpiresAt,
      connected_at: new Date().toISOString(),
    }, { onConflict: "user_id,provider" });
    return;
  }
  await (await db()).run(
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
  if (isSupabase()) {
    const { data } = await (await sb())
      .from("sources").select("*").eq("user_id", userId).eq("provider", provider).maybeSingle();
    return data ?? null;
  }
  const result = await (await db()).query<SourceRecord>(
    "SELECT * FROM sources WHERE user_id = ? AND provider = ?", [userId, provider]
  );
  return result.rows[0] ?? null;
}

export async function updateSourceToken(
  userId: string,
  provider: "figma" | "github",
  accessToken: string,
  tokenExpiresAt: string | null = null
): Promise<void> {
  if (isSupabase()) {
    await (await sb()).from("sources")
      .update({ access_token: accessToken, token_expires_at: tokenExpiresAt })
      .eq("user_id", userId).eq("provider", provider);
    return;
  }
  await (await db()).run(
    "UPDATE sources SET access_token = ?, token_expires_at = ? WHERE user_id = ? AND provider = ?",
    [accessToken, tokenExpiresAt, userId, provider]
  );
}

export async function updateFigmaFileKey(userId: string, fileKey: string): Promise<void> {
  if (isSupabase()) {
    await (await sb()).from("sources")
      .update({ figma_file_key: fileKey }).eq("user_id", userId).eq("provider", "figma");
    return;
  }
  await (await db()).run(
    "UPDATE sources SET figma_file_key = ? WHERE user_id = ? AND provider = 'figma'", [fileKey, userId]
  );
}

export async function updateGithubRepo(userId: string, repo: string): Promise<void> {
  if (isSupabase()) {
    await (await sb()).from("sources")
      .update({ github_repo: repo }).eq("user_id", userId).eq("provider", "github");
    return;
  }
  await (await db()).run(
    "UPDATE sources SET github_repo = ? WHERE user_id = ? AND provider = 'github'", [repo, userId]
  );
}

export async function disconnectSource(userId: string, provider: "figma" | "github"): Promise<void> {
  if (isSupabase()) {
    await (await sb()).from("sources").update({
      status: "disconnected", access_token: null, refresh_token: null, token_expires_at: null,
    }).eq("user_id", userId).eq("provider", provider);
    return;
  }
  await (await db()).run(
    "UPDATE sources SET status = 'disconnected', access_token = NULL, refresh_token = NULL, token_expires_at = NULL WHERE user_id = ? AND provider = ?",
    [userId, provider]
  );
}
