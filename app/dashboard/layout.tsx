import { getSession } from "@/lib/auth/session";
import { getReport, saveReport } from "@/lib/store";
import { runScan } from "@/lib/run-scan";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";
import { VerificationBanner } from "@/components/VerificationBanner";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/signup");

  // Ensure a report exists so the top bar has a real "last scan" timestamp
  // even on first load. Individual pages re-fetch the report themselves —
  // this only guarantees one exists.
  let report = await getReport(session.email);
  if (!report) {
    report = await runScan(session.workspaceName, session.email);
    await saveReport(session.email, report);
  }

  const isPaid = session.tier !== "free";

  return (
    <div className="flex min-h-screen bg-[#F8F7F4] p-4 gap-4">
      <Sidebar workspaceName={session.workspaceName} isPaid={isPaid} email={session.email} />
      <div className="flex-1 min-w-0 flex flex-col gap-4">
        <TopBar workspaceName={session.workspaceName} scannedAt={report.scannedAt} />
        {!session.emailVerified && <VerificationBanner email={session.email} />}
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
