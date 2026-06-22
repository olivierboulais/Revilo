import { ScanReport } from "@/lib/types";
import { findUserByEmail } from "@/lib/db/users";
import { saveScanForUser, getLatestScanForUser } from "@/lib/db/scans";

// Real persistence, in priority order:
//   1. Database (lib/db/scans.ts) — used whenever the email resolves to a
//      real user record, i.e. once real auth (lib/auth/session.ts) is wired
//      in. This is now the primary path for anyone signed up through real
//      signup/login.
//   2. Vercel KV — kept as a fallback for any caller that, for whatever
//      reason, has an email that doesn't resolve to a database user yet.
//   3. In-process Map — local-dev fallback with zero setup, same as before.
//
// The public interface (saveReport/getReport, keyed by email) is unchanged
// so none of the 17 call sites across the app need to change — this file
// is exactly the kind of swap point the rest of this codebase already
// follows the same pattern for.

const hasKV = Boolean(process.env.KV_REST_API_URL);

const reportsByEmail = new Map<string, ScanReport>();

function keyFor(email: string): string {
  return `report:${email}`;
}

export async function saveReport(email: string, report: ScanReport): Promise<void> {
  const user = await findUserByEmail(email).catch(() => null);
  if (user) {
    await saveScanForUser(user.id, report);
    return;
  }

  if (hasKV) {
    const { kv } = await import("@vercel/kv");
    await kv.set(keyFor(email), report, { ex: 60 * 60 * 24 * 30 });
    return;
  }
  reportsByEmail.set(email, report);
}

export async function getReport(email: string): Promise<ScanReport | null> {
  const user = await findUserByEmail(email).catch(() => null);
  if (user) {
    const fromDb = await getLatestScanForUser(user.id);
    if (fromDb) return fromDb;
    // Fall through to KV/memory in case a scan was saved before this user
    // existed in the database (shouldn't normally happen, but avoids
    // silently losing data during the transition).
  }

  if (hasKV) {
    const { kv } = await import("@vercel/kv");
    const report = await kv.get<ScanReport>(keyFor(email));
    return report ?? null;
  }
  return reportsByEmail.get(email) ?? null;
}
