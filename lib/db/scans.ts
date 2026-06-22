import { getDb } from "@/lib/db/client";
import { ScanReport } from "@/lib/types";
import { randomUUID } from "crypto";

export async function saveScanForUser(userId: string, report: ScanReport): Promise<void> {
  const db = await getDb();
  await db.run(
    "INSERT INTO scans (id, user_id, report_json, scanned_at) VALUES (?, ?, ?, ?)",
    [randomUUID(), userId, JSON.stringify(report), report.scannedAt]
  );
}

export async function getLatestScanForUser(userId: string): Promise<ScanReport | null> {
  const db = await getDb();
  const result = await db.query<{ report_json: string }>(
    "SELECT report_json FROM scans WHERE user_id = ? ORDER BY scanned_at DESC LIMIT 1",
    [userId]
  );
  if (result.rows.length === 0) return null;
  return JSON.parse(result.rows[0].report_json) as ScanReport;
}

// Powers real history for the Score Trend chart (see lib/mock-history.ts,
// which currently generates a fake trailing trend because this function
// didn't exist yet). Returns most recent first.
export async function getScanHistoryForUser(userId: string, limit = 8): Promise<ScanReport[]> {
  const db = await getDb();
  const result = await db.query<{ report_json: string }>(
    "SELECT report_json FROM scans WHERE user_id = ? ORDER BY scanned_at DESC LIMIT ?",
    [userId, limit]
  );
  return result.rows.map((r) => JSON.parse(r.report_json) as ScanReport);
}
