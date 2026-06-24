import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { runScan } from "@/lib/run-scan";
import { getReport, saveReport } from "@/lib/store";
import { detectDrift } from "@/lib/drift/detect";
import { sendDriftAlert } from "@/lib/drift/alert";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
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
