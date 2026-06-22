import { NextResponse } from "next/server";
import { getUsersByTier } from "@/lib/db/users";
import { getReport, saveReport } from "@/lib/store";
import { runScan } from "@/lib/run-scan";
import { detectDrift } from "@/lib/drift/detect";
import { sendDriftAlert } from "@/lib/drift/alert";

// Vercel Cron calls this with an Authorization header:
// Authorization: Bearer <CRON_SECRET>
// Set CRON_SECRET in your Vercel env vars to a random string.
function isAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false; // require the secret to always be set
  const auth = request.headers.get("authorization") ?? "";
  return auth === `Bearer ${secret}`;
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const users = await getUsersByTier("monitoring");
  const origin = new URL(request.url).origin;
  const results: Array<{ email: string; status: string }> = [];

  for (const user of users) {
    try {
      const previous = await getReport(user.email);
      const report = await runScan(user.workspace_name, user.email);
      await saveReport(user.email, report);

      if (previous) {
        const drift = detectDrift(previous, report);
        if (drift.hasDrift) {
          await sendDriftAlert(user.email, user.workspace_name, drift, origin);
        }
      }

      results.push({ email: user.email, status: "ok" });
    } catch (err) {
      console.error(`Rescan failed for ${user.email}:`, err);
      results.push({ email: user.email, status: "error" });
    }
  }

  return NextResponse.json({ rescanned: results.length, results });
}
