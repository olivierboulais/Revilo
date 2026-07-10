import { randomUUID } from "crypto";
import { getSupabaseClient, isSupabase } from "@/lib/db/supabase";
import { getDb } from "@/lib/db/client";
import { ScanReport } from "@/lib/types";

async function sb() { return getSupabaseClient(); }
async function db() { return getDb(); }

export async function saveScanForUser(userId: string, report: ScanReport): Promise<void> {
  if (isSupabase()) {
    await (await sb()).from("scans").insert({
      id: randomUUID(), user_id: userId,
      report_json: JSON.stringify(report), scanned_at: report.scannedAt,
    });
    return;
  }
  await (await db()).run(
    "INSERT INTO scans (id, user_id, report_json, scanned_at) VALUES (?, ?, ?, ?)",
    [randomUUID(), userId, JSON.stringify(report), report.scannedAt]
  );
}

export async function getLatestScanForUser(userId: string): Promise<ScanReport | null> {
  if (isSupabase()) {
    const { data } = await (await sb())
      .from("scans").select("report_json").eq("user_id", userId)
      .order("scanned_at", { ascending: false }).limit(1).maybeSingle();
    if (!data) return null;
    return JSON.parse(data.report_json) as ScanReport;
  }
  const result = await (await db()).query<{ report_json: string }>(
    "SELECT report_json FROM scans WHERE user_id = ? ORDER BY scanned_at DESC LIMIT 1", [userId]
  );
  if (result.rows.length === 0) return null;
  return JSON.parse(result.rows[0].report_json) as ScanReport;
}

export async function countScansToday(userId: string): Promise<number> {
  const midnight = new Date();
  midnight.setHours(0, 0, 0, 0);
  const since = midnight.toISOString();

  if (isSupabase()) {
    const { count } = await (await sb())
      .from("scans").select("id", { count: "exact", head: true })
      .eq("user_id", userId).gte("scanned_at", since);
    return count ?? 0;
  }
  const result = await (await db()).query<{ n: number }>(
    "SELECT COUNT(*) as n FROM scans WHERE user_id = ? AND scanned_at >= ?", [userId, since]
  );
  return result.rows[0]?.n ?? 0;
}

export async function getScanHistoryForUser(userId: string, limit = 8): Promise<ScanReport[]> {
  if (isSupabase()) {
    const { data } = await (await sb())
      .from("scans").select("report_json").eq("user_id", userId)
      .order("scanned_at", { ascending: false }).limit(limit);
    return (data ?? []).map((r: { report_json: string }) => JSON.parse(r.report_json) as ScanReport);
  }
  const result = await (await db()).query<{ report_json: string }>(
    "SELECT report_json FROM scans WHERE user_id = ? ORDER BY scanned_at DESC LIMIT ?", [userId, limit]
  );
  return result.rows.map((r) => JSON.parse(r.report_json) as ScanReport);
}
