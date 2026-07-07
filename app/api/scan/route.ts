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
  const limit = isPaid ? 20 : 5;
  const rl = await checkRateLimitAsync(`scan:${session.email}`, limit, 60 * 60 * 1000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: `Too many scans. You can run ${limit} scans per hour. Try again soon.` },
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
