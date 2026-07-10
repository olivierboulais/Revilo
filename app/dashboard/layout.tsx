import type { Metadata } from "next";
import { getSession } from "@/lib/auth/session";
import { ThemeProvider } from "@/components/ThemeProvider";

export const metadata: Metadata = { title: "Dashboard — Revilo" };
import { getReport, saveReport } from "@/lib/store";
import { runScan } from "@/lib/run-scan";
import { findUserByEmail } from "@/lib/db/users";
import { getSource } from "@/lib/db/sources";
import { peekRateLimitAsync } from "@/lib/rate-limit";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { TopBar } from "@/components/TopBar";
import { VerificationBanner } from "@/components/VerificationBanner";
import { DashboardShell } from "@/components/DashboardShell";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/signup");

  const [user, cachedReport] = await Promise.all([
    findUserByEmail(session.email),
    getReport(session.email),
  ]);

  const [figmaSource, githubSource] = user
    ? await Promise.all([getSource(user.id, "figma"), getSource(user.id, "github")])
    : [null, null];

  // OAuth connected = token exists. File key / repo are checked separately in ConnectFlow.
  const figmaConnected = figmaSource?.status === "connected" && Boolean(figmaSource.access_token);
  const githubConnected = githubSource?.status === "connected" && Boolean(githubSource.access_token);

  let report = cachedReport;
  if (!report) {
    report = await runScan(session.workspaceName, session.email);
    await saveReport(session.email, report);
  }

  const isPaid = session.tier !== "free";
  const scanLimit = isPaid ? 20 : 5;
  const rl = await peekRateLimitAsync(`scan:${session.email}`, scanLimit, 24 * 60 * 60 * 1000);

  return (
    <ThemeProvider>
    <Suspense>
    <DashboardShell
      workspaceName={session.workspaceName}
      isPaid={isPaid}
      email={session.email}
      tier={session.tier}
      figmaConnected={figmaConnected}
      figmaFileKey={figmaSource?.figma_file_key ?? null}
      githubConnected={githubConnected}
      githubRepo={githubSource?.github_repo ?? null}
    >
      <div className="flex-1 min-w-0 flex flex-col gap-4">
        <TopBar workspaceName={session.workspaceName} scannedAt={report.scannedAt} scansRemaining={rl.remaining} scansLimit={scanLimit} />
        {!session.emailVerified && <VerificationBanner email={session.email} />}
        <div className="flex-1">{children}</div>
      </div>
    </DashboardShell>
    </Suspense>
    </ThemeProvider>
  );
}
