import { getSession } from "@/lib/auth/session";
import { getReport, saveReport } from "@/lib/store";
import { runScan } from "@/lib/run-scan";
import { redirect } from "next/navigation";

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function FigmaIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 38 57" fill="none">
      <path d="M19 28.5a9.5 9.5 0 1 1 9.5-9.5 9.5 9.5 0 0 1-9.5 9.5Z" fill="#1ABCFE" />
      <path d="M9.5 38a9.5 9.5 0 0 1 9.5-9.5v19A9.5 9.5 0 0 1 9.5 38Z" fill="#0ACF83" />
      <path d="M19 0v19H9.5a9.5 9.5 0 1 1 0-19H19Z" fill="#FF7262" />
      <path d="M19 19h9.5a9.5 9.5 0 1 1 0 19H19V19Z" fill="#A259FF" />
      <path d="M0 9.5A9.5 9.5 0 0 1 9.5 0H19v19H9.5A9.5 9.5 0 0 1 0 9.5Z" fill="#F24E1E" />
    </svg>
  );
}

function GithubIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="#1C1C1A">
      <path d="M12 0C5.37 0 0 5.5 0 12.3c0 5.43 3.44 10.03 8.21 11.66.6.12.82-.27.82-.6v-2.1c-3.34.74-4.04-1.66-4.04-1.66-.55-1.43-1.33-1.8-1.33-1.8-1.09-.76.08-.75.08-.75 1.2.09 1.84 1.27 1.84 1.27 1.07 1.87 2.8 1.33 3.49 1.02.1-.78.42-1.33.76-1.64-2.67-.31-5.47-1.36-5.47-6.07 0-1.34.46-2.43 1.23-3.29-.12-.31-.53-1.57.12-3.28 0 0 1-.33 3.3 1.26a11.2 11.2 0 0 1 6 0c2.28-1.59 3.29-1.26 3.29-1.26.65 1.71.24 2.97.12 3.28.77.86 1.23 1.95 1.23 3.29 0 4.72-2.8 5.76-5.48 6.06.43.38.81 1.13.81 2.28v3.38c0 .34.22.72.83.6C20.56 22.32 24 17.72 24 12.3 24 5.5 18.63 0 12 0Z" />
    </svg>
  );
}

export default async function SourcesPage() {
  const session = await getSession();
  if (!session) redirect("/signup");

  let report = await getReport(session.email);
  if (!report) {
    report = await runScan(session.workspaceName);
    await saveReport(session.email, report);
  }

  const figmaComponents = report.components.filter((c) => c.source === "figma").length;
  const githubComponents = report.components.filter((c) => c.source === "github").length;

  return (
    <div className="px-6 py-8">
      <h1 className="text-[22px] font-semibold tracking-tight mb-1">Sources</h1>
      <p className="text-[13px] text-gray mb-6">The Figma and GitHub sources Revilo scans to build this report.</p>

      <div className="flex flex-col gap-4 max-w-[640px]">
        <div className="rounded-2xl border border-line bg-white p-5">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="w-11 h-11 rounded-xl bg-[#F8F7F4] flex items-center justify-center flex-shrink-0">
                <FigmaIcon />
              </span>
              <div>
                <div className="text-[14px] font-medium">Figma</div>
                <div className="text-[12px] text-gray flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-good" />
                  Connected
                </div>
              </div>
            </div>
            <button className="text-[12px] font-medium px-3 py-1.5 rounded-full border border-line hover:bg-black/[0.03] transition-colors">
              Reconnect
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3 text-[12.5px] mb-3">
            <div>
              <div className="text-gray mb-0.5">Library</div>
              <div className="font-medium">{report.workspaceName}</div>
            </div>
            <div>
              <div className="text-gray mb-0.5">Components scanned</div>
              <div className="font-medium">{figmaComponents}</div>
            </div>
          </div>
          <div className="text-[11.5px] text-gray pt-3 border-t border-line flex items-center justify-between">
            <span>Last successful scan: {timeAgo(report.scannedAt)}</span>
            <button className="text-[#B3401F] hover:underline">Remove source</button>
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-white p-5">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="w-11 h-11 rounded-xl bg-[#F8F7F4] flex items-center justify-center flex-shrink-0">
                <GithubIcon />
              </span>
              <div>
                <div className="text-[14px] font-medium">GitHub</div>
                <div className="text-[12px] text-gray flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-good" />
                  Connected
                </div>
              </div>
            </div>
            <button className="text-[12px] font-medium px-3 py-1.5 rounded-full border border-line hover:bg-black/[0.03] transition-colors">
              Reconnect
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3 text-[12.5px] mb-3">
            <div>
              <div className="text-gray mb-0.5">Repository</div>
              <div className="font-medium">{report.workspaceName.toLowerCase().replace(/\s+/g, "-")}</div>
            </div>
            <div>
              <div className="text-gray mb-0.5">Components scanned</div>
              <div className="font-medium">{githubComponents}</div>
            </div>
          </div>
          <div className="text-[11.5px] text-gray pt-3 border-t border-line flex items-center justify-between">
            <span>Last successful scan: {timeAgo(report.scannedAt)}</span>
            <button className="text-[#B3401F] hover:underline">Remove source</button>
          </div>
        </div>
      </div>

      <p className="text-[11px] text-gray mt-6 max-w-[640px]">
        Library and repository names are illustrative until real Figma/GitHub OAuth metadata is wired in.
      </p>
    </div>
  );
}
