"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";

type SourceStatus = "idle" | "connecting" | "connected";

function FigmaIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 38 57" fill="none">
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
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.5 0 12.3c0 5.43 3.44 10.03 8.21 11.66.6.12.82-.27.82-.6v-2.1c-3.34.74-4.04-1.66-4.04-1.66-.55-1.43-1.33-1.8-1.33-1.8-1.09-.76.08-.75.08-.75 1.2.09 1.84 1.27 1.84 1.27 1.07 1.87 2.8 1.33 3.49 1.02.1-.78.42-1.33.76-1.64-2.67-.31-5.47-1.36-5.47-6.07 0-1.34.46-2.43 1.23-3.29-.12-.31-.53-1.57.12-3.28 0 0 1-.33 3.3 1.26a11.2 11.2 0 0 1 6 0c2.28-1.59 3.29-1.26 3.29-1.26.65 1.71.24 2.97.12 3.28.77.86 1.23 1.95 1.23 3.29 0 4.72-2.8 5.76-5.48 6.06.43.38.81 1.13.81 2.28v3.38c0 .34.22.72.83.6C20.56 22.32 24 17.72 24 12.3 24 5.5 18.63 0 12 0Z" />
    </svg>
  );
}

interface SourceCardProps {
  name: string;
  description: string;
  icon: React.ReactNode;
  status: SourceStatus;
  onConnect: () => void;
}

function SourceCard({ name, description, icon, status, onConnect }: SourceCardProps) {
  return (
    <div className="rounded-2xl border border-line bg-white p-5 flex items-center gap-4">
      <div className="w-11 h-11 rounded-xl bg-[#F8F7F4] flex items-center justify-center flex-shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="text-[15px] font-medium">{name}</div>
        <div className="text-[13px] text-gray">{description}</div>
      </div>
      {status === "idle" && (
        <Button variant="outline" withArrow={false} onClick={onConnect} className="text-[13px]">
          Connect
        </Button>
      )}
      {status === "connecting" && (
        <span className="text-[13px] text-gray flex items-center gap-2">
          <span className="w-3 h-3 rounded-full border-2 border-line border-t-lilac-deep animate-spin" />
          Connecting…
        </span>
      )}
      {status === "connected" && (
        <span className="text-[13px] text-good font-medium flex items-center gap-1.5">
          <svg width="14" height="14" viewBox="0 0 10 10" fill="none">
            <path d="M1.5 5L4 7.5L8.5 2.5" stroke="#34D399" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Connected
        </span>
      )}
    </div>
  );
}

// Mock OAuth: a real implementation redirects to Figma's/GitHub's OAuth
// consent screen and handles the callback. This simulates that round trip
// with a timeout so the flow feels real without live credentials.
function simulateConnect(setStatus: (s: SourceStatus) => void) {
  setStatus("connecting");
  setTimeout(() => setStatus("connected"), 1100);
}

export function ConnectFlow() {
  const router = useRouter();
  const [figma, setFigma] = useState<SourceStatus>("idle");
  const [github, setGithub] = useState<SourceStatus>("idle");

  const bothConnected = figma === "connected" && github === "connected";

  return (
    <div className="w-full max-w-[440px]">
      <h1 className="text-[28px] font-semibold tracking-tight leading-tight mb-2">Connect your sources</h1>
      <p className="text-[14px] text-gray mb-8 leading-relaxed">
        Revilo compares your Figma library against your codebase to find where they've drifted apart.
      </p>
      <div className="flex flex-col gap-3">
        <SourceCard
          name="Figma"
          description="Components, variants, tokens, and styles"
          icon={<FigmaIcon />}
          status={figma}
          onConnect={() => simulateConnect(setFigma)}
        />
        <SourceCard
          name="GitHub"
          description="Component files, token files, and Storybook"
          icon={<GithubIcon />}
          status={github}
          onConnect={() => simulateConnect(setGithub)}
        />
      </div>
      <Button
        variant="dark"
        className="justify-center w-full mt-8"
        disabled={!bothConnected}
        onClick={() => router.push("/scan")}
      >
        Run scan
      </Button>
      {!bothConnected && <p className="text-[12px] text-gray text-center mt-3">Connect both sources to continue.</p>}
    </div>
  );
}
