import { getSession } from "@/lib/auth/session";
import { getReport, saveReport } from "@/lib/store";
import { runScan } from "@/lib/run-scan";
import { findUserByEmail } from "@/lib/db/users";
import { getSource } from "@/lib/db/sources";
import { redirect } from "next/navigation";
import { TopBar } from "@/components/TopBar";
import { VerificationBanner } from "@/components/VerificationBanner";
import { MockDataBanner } from "@/components/MockDataBanner";
import { DashboardShell } from "@/components/DashboardShell";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/signup");

  const user = await findUserByEmail(session.email);
  const [figmaSource, githubSource] = user
    ? await Promise.all([getSource(user.id, "figma"), getSource(user.id, "github")])
    : [null, null];

  const figmaConnected = figmaSource?.status === "connected" && Boolean(figmaSource.access_token) && Boolean(figmaSource.figma_file_key);
  const githubConnected = githubSource?.status === "connected" && Boolean(githubSource.access_token) && Boolean(githubSource.github_repo);

  let report = await getReport(session.email);
  if (!report) {
    report = await runScan(session.workspaceName, session.email);
    await saveReport(session.email, report);
  }

  const isPaid = session.tier !== "free";

  return (
    <DashboardShell
      workspaceName={session.workspaceName}
      isPaid={isPaid}
      email={session.email}
      tier={session.tier}
    >
      <div className="flex-1 min-w-0 flex flex-col gap-4">
        <TopBar workspaceName={session.workspaceName} scannedAt={report.scannedAt} />
        {!session.emailVerified && <VerificationBanner email={session.email} />}
        <MockDataBanner figmaConnected={figmaConnected} githubConnected={githubConnected} />
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </DashboardShell>
  );
}
