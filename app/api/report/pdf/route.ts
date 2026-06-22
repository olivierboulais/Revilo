import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getReport, saveReport } from "@/lib/store";
import { runScan } from "@/lib/run-scan";
import { generateReportPdf } from "@/lib/pdf/generate";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  if (session.tier === "free") {
    return NextResponse.json({ error: "PDF export requires a Pro or Monitoring plan" }, { status: 403 });
  }

  let report = await getReport(session.email);
  if (!report) {
    report = await runScan(session.workspaceName, session.email);
    await saveReport(session.email, report);
  }

  const pdf = await generateReportPdf(report);
  const filename = `revilo-report-${report.workspaceName.replace(/\s+/g, "-").toLowerCase()}-${new Date(report.scannedAt).toISOString().slice(0, 10)}.pdf`;

  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
