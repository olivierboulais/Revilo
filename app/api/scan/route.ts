import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { runScan } from "@/lib/run-scan";
import { saveReport } from "@/lib/store";

export async function POST() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const report = await runScan(session.workspaceName, session.email);
  await saveReport(session.email, report);

  return NextResponse.json({ ok: true });
}
