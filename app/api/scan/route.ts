import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { runScan } from "@/lib/run-scan";
import { getReport, saveReport } from "@/lib/store";
import { detectDrift } from "@/lib/drift/detect";
import { sendDriftAlert } from "@/lib/drift/alert";
import { checkRateLimitAsync } from "@/lib/rate-limit";

export const maxDuration = 60;

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const isPaid = session.tier !== "free";
  const limit = isPaid ? 100 : 10;
  const rl = await checkRateLimitAsync(`scan:${session.email}`, limit, 24 * 60 * 60 * 1000);
  if (!rl.allowed) {
    const resetHours = Math.ceil((rl.resetAt - Date.now()) / (1000 * 60 * 60));
    const message = isPaid
      ? `You've run ${limit} scans today. Resets in ~${resetHours}h.`
      : `Free accounts are limited to ${limit} scans per day. Upgrade to Pro for more, or try again tomorrow.`;
    return NextResponse.json(
      { error: message },
      { status: 429, headers: { "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } }
    );
  }

  const previous = await getReport(session.email);
  const report = await runScan(session.workspaceName, session.email);
  await saveReport(session.email, report);

  // Send drift alert for monitoring users if scores dropped significantly
  if (session.tier === "monitoring" && previous) {
    const drift = detectDrift(previous, report);
    if (drift.hasDrift) {
      const origin = new URL(request.url).origin;
      sendDriftAlert(session.email, session.workspaceName, drift, origin).catch(console.error);
    }
  }

  return NextResponse.json({ ok: true, dataSource: report.dataSource });
}
