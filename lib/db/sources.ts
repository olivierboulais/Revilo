import { randomUUID } from "crypto";
import { getSupabaseClient, isSupabase } from "@/lib/db/supabase";
import { getDb } from "@/lib/db/client";
import { encryptToken, safeDecryptToken } from "@/lib/token-crypto";

export type FigmaFileRole = "seed" | "primitive" | "semantic" | "component" | "project";

export interface FigmaFile {
  key: string;
  role: FigmaFileRole;
  label: string;
}

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

export function parseFigmaFiles(raw: string | null): FigmaFile[] {
  if (!raw) return [];
  const trimmed = raw.trim();
  if (trimmed.startsWith("[")) {
    try { return JSON.parse(trimmed) as FigmaFile[]; } catch { /* fall through */ }
  }
  return [{ key: trimmed, role: "project", label: "Design System" }];
}

export function serializeFigmaFiles(files: FigmaFile[]): string {
  if (files.length === 0) return "";
  return JSON.stringify(files);
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
  const encAccess = encryptToken(accessToken);
  const encRefresh = refreshToken ? encryptToken(refreshToken) : null;
  if (isSupabase()) {
    const { error } = await (await sb()).from("sources").upsert({
      id: randomUUID(), user_id: userId, provider, status: "connected",
      access_token: encAccess, refresh_token: encRefresh,
      external_name: externalName, token_expires_at: tokenExpiresAt,
      connected_at: new Date().toISOString(),
    }, { onConflict: "user_id,provider" });
    if (error) throw new Error(`upsertSource (${provider}): ${error.message} [${error.code}]`);
    return;
  }
  await (await db()).run(
    `INSERT INTO sources (id, user_id, provider, status, access_token, refresh_token, external_name, token_expires_at)
     VALUES (?, ?, ?, 'connected', ?, ?, ?, ?)
     ON CONFLICT(user_id, provider) DO UPDATE SET
       status = 'connected', access_token = excluded.access_token,
       refresh_token = excluded.refresh_token, external_name = excluded.external_name,
       token_expires_at = excluded.token_expires_at`,
    [randomUUID(), userId, provider, encAccess, encRefresh, externalName, tokenExpiresAt]
  );
}

export async function getSource(userId: string, provider: "figma" | "github"): Promise<SourceRecord | null> {
  let row: SourceRecord | null = null;
  if (isSupabase()) {
    const { data } = await (await sb())
      .from("sources").select("*").eq("user_id", userId).eq("provider", provider).maybeSingle();
    row = data ?? null;
  } else {
    const result = await (await db()).query<SourceRecord>(
      "SELECT * FROM sources WHERE user_id = ? AND provider = ?", [userId, provider]
    );
    row = result.rows[0] ?? null;
  }
  if (!row) return null;
  return {
    ...row,
    access_token: safeDecryptToken(row.access_token),
    refresh_token: safeDecryptToken(row.refresh_token),
  };
}

export async function updateSourceToken(
  userId: string,
  provider: "figma" | "github",
  accessToken: string,
  tokenExpiresAt: string | null = null
): Promise<void> {
  const encAccess = encryptToken(accessToken);
  if (isSupabase()) {
    const { error } = await (await sb()).from("sources")
      .update({ access_token: encAccess, token_expires_at: tokenExpiresAt })
      .eq("user_id", userId).eq("provider", provider);
    if (error) throw new Error(`updateSourceToken (${provider}): ${error.message}`);
    return;
  }
  await (await db()).run(
    "UPDATE sources SET access_token = ?, token_expires_at = ? WHERE user_id = ? AND provider = ?",
    [encAccess, tokenExpiresAt, userId, provider]
  );
}

export async function updateFigmaFileKey(userId: string, fileKey: string): Promise<void> {
  if (isSupabase()) {
    const { error } = await (await sb()).from("sources")
      .update({ figma_file_key: fileKey }).eq("user_id", userId).eq("provider", "figma");
    if (error) throw new Error(`updateFigmaFileKey: ${error.message}`);
    return;
  }
  await (await db()).run(
    "UPDATE sources SET figma_file_key = ? WHERE user_id = ? AND provider = 'figma'", [fileKey, userId]
  );
}

export async function updateGithubRepo(userId: string, repo: string): Promise<void> {
  if (isSupabase()) {
    const { error } = await (await sb()).from("sources")
      .update({ github_repo: repo }).eq("user_id", userId).eq("provider", "github");
    if (error) throw new Error(`updateGithubRepo: ${error.message}`);
    return;
  }
  await (await db()).run(
    "UPDATE sources SET github_repo = ? WHERE user_id = ? AND provider = 'github'", [repo, userId]
  );
}

export async function disconnectSource(userId: string, provider: "figma" | "github"): Promise<void> {
  if (isSupabase()) {
    const { error } = await (await sb()).from("sources").update({
      status: "disconnected", access_token: null, refresh_token: null, token_expires_at: null,
    }).eq("user_id", userId).eq("provider", provider);
    if (error) throw new Error(`disconnectSource (${provider}): ${error.message}`);
    return;
  }
  await (await db()).run(
    "UPDATE sources SET status = 'disconnected', access_token = NULL, refresh_token = NULL, token_expires_at = NULL WHERE user_id = ? AND provider = ?",
    [userId, provider]
  );
}
