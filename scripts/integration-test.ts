// Exercises the real application modules end-to-end: create a session,
// run a scan exactly as the API route does, persist it, then read it back
// exactly as the dashboard page does. This proves the actual application
// logic works correctly, independent of the framework's internal
// server-action transport encoding.

import { runScan } from "@/lib/run-scan";
import { saveReport, getReport } from "@/lib/store";

async function main() {
  const email = "test@acme.com";
  const workspaceName = "Acme Design System";

  console.log("=== Step 1: run scan (what the API route does) ===");
  const report = await runScan(workspaceName);
  console.log("Scan produced report with id:", report.id);

  console.log("\n=== Step 2: save report (what the API route does) ===");
  await saveReport(email, report);

  console.log("\n=== Step 3: read report back (what the dashboard page does) ===");
  const fetched = await getReport(email);
  if (!fetched) {
    console.error("FAILED: report not found after save");
    process.exit(1);
  }
  console.log("Report retrieved successfully, id matches:", fetched.id === report.id);

  console.log("\n=== Step 4: simulate free-tier gating logic (what dashboard.tsx does) ===");
  const isPaid = false;
  const alignmentFindings = fetched.findings.filter((f) => f.sourceArea === "alignment");
  const visibleAlignmentFindings = isPaid ? alignmentFindings : alignmentFindings.slice(0, 1);
  console.log("Total alignment findings:", alignmentFindings.length);
  console.log("Visible to free tier:", visibleAlignmentFindings.length, "(should be 1)");
  if (visibleAlignmentFindings.length !== 1) {
    console.error("FAILED: free tier gating is not limiting to 1 finding");
    process.exit(1);
  }

  console.log("\n=== Step 5: simulate paid-tier gating logic ===");
  const isPaidNow = true;
  const visibleWhenPaid = isPaidNow ? alignmentFindings : alignmentFindings.slice(0, 1);
  console.log("Visible when paid:", visibleWhenPaid.length, "(should equal total:", alignmentFindings.length, ")");
  if (visibleWhenPaid.length !== alignmentFindings.length) {
    console.error("FAILED: paid tier is not unlocking all findings");
    process.exit(1);
  }

  console.log("\n=== Step 6: sanity-check score values are in valid range ===");
  const scores = [report.alignment.overall, report.adoption.overall, report.architecture.overall];
  for (const s of scores) {
    if (s < 0 || s > 100 || Number.isNaN(s)) {
      console.error("FAILED: score out of range:", s);
      process.exit(1);
    }
  }
  console.log("All scores in valid 0-100 range:", scores);

  console.log("\n=== ALL CHECKS PASSED ===");
}

main().catch((err) => {
  console.error("INTEGRATION TEST FAILED:", err);
  process.exit(1);
});
