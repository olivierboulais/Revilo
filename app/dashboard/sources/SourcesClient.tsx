"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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
    <svg width="22" height="22" viewBox="0 0 38 57" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M9.5 57C14.747 57 19 52.747 19 47.5V38H9.5C4.253 38 0 42.253 0 47.5S4.253 57 9.5 57Z" fill="#0ACF83"/>
      <path d="M0 28.5C0 23.253 4.253 19 9.5 19H19v19H9.5C4.253 38 0 33.747 0 28.5Z" fill="#A259FF"/>
      <path d="M0 9.5C0 4.253 4.253 0 9.5 0H19v19H9.5C4.253 19 0 14.747 0 9.5Z" fill="#F24E1E"/>
      <path d="M19 0h9.5C33.747 0 38 4.253 38 9.5S33.747 19 28.5 19H19V0Z" fill="#FF7262"/>
      <path d="M38 28.5c0 5.247-4.253 9.5-9.5 9.5S19 33.747 19 28.5s4.253-9.5 9.5-9.5 9.5 4.253 9.5 9.5Z" fill="#1ABCFE"/>
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

interface FigmaInfo {
  externalName: string | null;
  fileKey: string | null;
  connectedAt: string;
}

interface GithubInfo {
  externalName: string | null;
  repo: string | null;
  connectedAt: string;
}

interface Props {
  figma: FigmaInfo | null;
  github: GithubInfo | null;
}

export function SourcesClient({ figma: initialFigma, github: initialGithub }: Props) {
  const router = useRouter();
  const [figma, setFigma] = useState(initialFigma);
  const [github, setGithub] = useState(initialGithub);
  const [disconnecting, setDisconnecting] = useState<"figma" | "github" | null>(null);

  async function disconnect(provider: "figma" | "github") {
    if (!confirm(`Remove ${provider === "figma" ? "Figma" : "GitHub"} connection? This won't delete your scan history.`)) return;
    setDisconnecting(provider);
    try {
      await fetch("/api/sources/disconnect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider }),
      });
      if (provider === "figma") setFigma(null);
      else setGithub(null);
    } finally {
      setDisconnecting(null);
    }
  }

  return (
    <div className="flex flex-col gap-4 max-w-[640px]">
      {/* Figma */}
      <div className="rounded-2xl border border-line bg-white p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="w-11 h-11 rounded-xl bg-[#F8F7F4] flex items-center justify-center flex-shrink-0">
              <FigmaIcon />
            </span>
            <div>
              <div className="text-[14px] font-medium">Figma</div>
              <div className="text-[12px] text-gray flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${figma ? "bg-good" : "bg-gray-300"}`} />
                {figma ? "Connected" : "Not connected"}
              </div>
            </div>
          </div>
          {figma ? (
            <button
              onClick={() => { window.location.href = "/api/auth/figma/start"; }}
              className="text-[12px] font-medium px-3 py-1.5 rounded-full border border-line hover:bg-black/[0.03] transition-colors"
            >
              Reconnect
            </button>
          ) : (
            <button
              onClick={() => { window.location.href = "/api/auth/figma/start"; }}
              className="text-[12px] font-medium px-3 py-1.5 rounded-full border border-line hover:bg-black/[0.03] transition-colors"
            >
              Connect
            </button>
          )}
        </div>
        {figma && (
          <>
            <div className="grid grid-cols-2 gap-3 text-[12.5px] mb-3">
              <div>
                <div className="text-gray mb-0.5">File key</div>
                <div className="font-medium font-mono text-[11.5px]">{figma.fileKey ?? "Not set"}</div>
              </div>
              <div>
                <div className="text-gray mb-0.5">Connected</div>
                <div className="font-medium">{timeAgo(figma.connectedAt)}</div>
              </div>
            </div>
            <div className="text-[11.5px] text-gray pt-3 border-t border-line flex items-center justify-between">
              <span>
                {figma.fileKey ? "File key saved — ready to scan." : "Add a file key to start scanning."}
              </span>
              <button
                onClick={() => disconnect("figma")}
                disabled={disconnecting === "figma"}
                className="text-[#B3401F] hover:underline disabled:opacity-50"
              >
                {disconnecting === "figma" ? "Removing…" : "Remove source"}
              </button>
            </div>
          </>
        )}
        {!figma && (
          <p className="text-[12.5px] text-gray">
            Connect your Figma account to scan components, variants, and tokens.
          </p>
        )}
      </div>

      {/* GitHub */}
      <div className="rounded-2xl border border-line bg-white p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="w-11 h-11 rounded-xl bg-[#F8F7F4] flex items-center justify-center flex-shrink-0">
              <GithubIcon />
            </span>
            <div>
              <div className="text-[14px] font-medium">GitHub</div>
              <div className="text-[12px] text-gray flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${github ? "bg-good" : "bg-gray-300"}`} />
                {github ? "Connected" : "Not connected"}
              </div>
            </div>
          </div>
          {github ? (
            <button
              onClick={() => { window.location.href = "/api/auth/github/start"; }}
              className="text-[12px] font-medium px-3 py-1.5 rounded-full border border-line hover:bg-black/[0.03] transition-colors"
            >
              Reconnect
            </button>
          ) : (
            <button
              onClick={() => { window.location.href = "/api/auth/github/start"; }}
              className="text-[12px] font-medium px-3 py-1.5 rounded-full border border-line hover:bg-black/[0.03] transition-colors"
            >
              Connect
            </button>
          )}
        </div>
        {github && (
          <>
            <div className="grid grid-cols-2 gap-3 text-[12.5px] mb-3">
              <div>
                <div className="text-gray mb-0.5">Repository</div>
                <div className="font-medium font-mono text-[11.5px]">{github.repo ?? "Not set"}</div>
              </div>
              <div>
                <div className="text-gray mb-0.5">Account</div>
                <div className="font-medium">{github.externalName ?? "—"}</div>
              </div>
            </div>
            <div className="text-[11.5px] text-gray pt-3 border-t border-line flex items-center justify-between">
              <span>
                {github.repo ? "Repository saved — ready to scan." : "Set a repository to start scanning."}
              </span>
              <button
                onClick={() => disconnect("github")}
                disabled={disconnecting === "github"}
                className="text-[#B3401F] hover:underline disabled:opacity-50"
              >
                {disconnecting === "github" ? "Removing…" : "Remove source"}
              </button>
            </div>
          </>
        )}
        {!github && (
          <p className="text-[12.5px] text-gray">
            Connect your GitHub account to scan component files and extract design tokens.
          </p>
        )}
      </div>

      {(!figma || !github) && (
        <div className="rounded-2xl bg-[#F8F7F4] border border-line p-4">
          <p className="text-[12.5px] text-gray">
            Revilo will use mock data for any source that isn&apos;t connected.{" "}
            <button
              onClick={() => router.push("/connect")}
              className="font-medium text-[#1C1C1A] hover:underline"
            >
              Go to Connect →
            </button>
          </p>
        </div>
      )}
    </div>
  );
}
