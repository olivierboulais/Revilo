import { ScanReport } from "@/lib/types";

// Real persistence: Vercel KV (managed Redis) when KV_REST_API_URL is set —
// i.e. once this is deployed on Vercel with a KV store attached. Falls back
// to an in-process Map for local development before that's configured, so
// `npm run dev` still works with zero setup.
//
// This is the fix for the single biggest limitation of the mock build: that
// in-memory map didn't survive a server restart and would silently lose data
// across multiple server instances, which is the default once deployed.

const hasKV = Boolean(process.env.KV_REST_API_URL);

const reportsByEmail = new Map<string, ScanReport>();

function keyFor(email: string): string {
  return `report:${email}`;
}

export async function saveReport(email: string, report: ScanReport): Promise<void> {
  if (hasKV) {
    const { kv } = await import("@vercel/kv");
    // 30-day expiry — a scan report is a point-in-time snapshot, not
    // something that should accumulate forever for a free account.
    await kv.set(keyFor(email), report, { ex: 60 * 60 * 24 * 30 });
    return;
  }
  reportsByEmail.set(email, report);
}

export async function getReport(email: string): Promise<ScanReport | null> {
  if (hasKV) {
    const { kv } = await import("@vercel/kv");
    const report = await kv.get<ScanReport>(keyFor(email));
    return report ?? null;
  }
  return reportsByEmail.get(email) ?? null;
}
