"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";

type SourceStatus = "idle" | "connected";

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

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 10 10" fill="none">
      <path d="M1.5 5L4 7.5L8.5 2.5" stroke="#34D399" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

interface SourceCardProps {
  name: string;
  description: string;
  icon: React.ReactNode;
  status: SourceStatus;
  onConnect: () => void;
  children?: React.ReactNode;
}

function SourceCard({ name, description, icon, status, onConnect, children }: SourceCardProps) {
  return (
    <div className="rounded-2xl border border-line bg-white p-5">
      <div className="flex items-center gap-4">
        <div className="w-11 h-11 rounded-xl bg-[#F8F7F4] flex items-center justify-center flex-shrink-0">{icon}</div>
        <div className="flex-1 min-w-0">
          <div className="text-[15px] font-medium">{name}</div>
          <div className="text-[13px] text-gray">{description}</div>
        </div>
        {status === "idle" && (
          <Button variant="outline" withArrow={false} onClick={onConnect} className="text-[13px] flex-shrink-0">
            Connect
          </Button>
        )}
        {status === "connected" && (
          <span className="text-[13px] text-good font-medium flex items-center gap-1.5 flex-shrink-0">
            <CheckIcon />
            Connected
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

interface Props {
  figmaConnected: boolean;
  figmaFileKey: string | null;
  githubConnected: boolean;
  githubRepo: string | null;
  error?: string | null;
}

export function ConnectFlow({ figmaConnected, figmaFileKey, githubConnected, githubRepo, error }: Props) {
  const router = useRouter();
  const [fileKeyInput, setFileKeyInput] = useState(figmaFileKey ?? "");
  const [repoInput, setRepoInput] = useState(githubRepo ?? "");
  const [savingFileKey, setSavingFileKey] = useState(false);
  const [savingRepo, setSavingRepo] = useState(false);
  const [fileKeySaved, setFileKeySaved] = useState(Boolean(figmaFileKey));
  const [repoSaved, setRepoSaved] = useState(Boolean(githubRepo));
  const [fieldError, setFieldError] = useState<string | null>(null);

  const figmaReady = figmaConnected && fileKeySaved;
  const githubReady = githubConnected && repoSaved;
  const bothReady = figmaReady && githubReady;

  async function saveFileKey() {
    if (!fileKeyInput.trim()) return;
    setSavingFileKey(true);
    setFieldError(null);
    try {
      const res = await fetch("/api/sources/figma/file-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileKey: fileKeyInput.trim() }),
      });
      if (!res.ok) throw new Error("Failed to save file key");
      setFileKeySaved(true);
    } catch {
      setFieldError("Could not save the Figma file key. Please try again.");
    } finally {
      setSavingFileKey(false);
    }
  }

  async function saveRepo() {
    const repo = repoInput.trim();
    if (!repo) return;
    if (!/^[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+$/.test(repo)) {
      setFieldError('Repo must be in "owner/repo" format.');
      return;
    }
    setSavingRepo(true);
    setFieldError(null);
    try {
      const res = await fetch("/api/sources/github/repo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repo }),
      });
      if (!res.ok) throw new Error("Failed to save repo");
      setRepoSaved(true);
    } catch {
      setFieldError("Could not save the GitHub repo. Please try again.");
    } finally {
      setSavingRepo(false);
    }
  }

  return (
    <div className="w-full max-w-[480px]">
      <h1 className="text-[28px] font-semibold tracking-tight leading-tight mb-2">Connect your sources</h1>
      <p className="text-[14px] text-gray mb-8 leading-relaxed">
        Revilo compares your Figma library against your codebase to find where they&apos;ve drifted apart.
      </p>

      {error && (
        <div className="mb-4 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-[13px] text-[#B91C1C] px-4 py-3">
          <p>{errorMessage(error)}</p>
          {isNotConfiguredError(error) && (
            <button
              onClick={() => router.push("/dashboard")}
              className="mt-2 text-[12px] font-medium text-[#B91C1C] underline underline-offset-2 hover:text-[#991B1B] transition-colors"
            >
              Continue with sample data instead
            </button>
          )}
        </div>
      )}

      <div className="flex flex-col gap-3">
        {/* Figma card */}
        <SourceCard
          name="Figma"
          description="Components, variants, tokens, and styles"
          icon={<FigmaIcon />}
          status={figmaConnected ? "connected" : "idle"}
          onConnect={() => { window.location.href = "/api/auth/figma/start"; }}
        >
          {figmaConnected && (
            <div className="mt-4 pt-4 border-t border-line">
              <label className="text-[12.5px] text-gray block mb-1.5">
                Figma file URL or key
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={fileKeyInput}
                  onChange={(e) => { setFileKeyInput(e.target.value); setFileKeySaved(false); }}
                  placeholder="https://www.figma.com/file/…"
                  className="flex-1 text-[13px] rounded-xl border border-line px-3 py-2 outline-none focus:border-[#1C1C1A] bg-white"
                />
                <Button
                  variant={fileKeySaved ? "outline" : "dark"}
                  withArrow={false}
                  onClick={saveFileKey}
                  disabled={savingFileKey || !fileKeyInput.trim()}
                  className="text-[13px] flex-shrink-0"
                >
                  {savingFileKey ? "Saving…" : fileKeySaved ? "Saved" : "Save"}
                </Button>
              </div>
              <p className="text-[11.5px] text-gray mt-1">
                Open the file in Figma and copy the URL from the address bar.
              </p>
            </div>
          )}
        </SourceCard>

        {/* GitHub card */}
        <SourceCard
          name="GitHub"
          description="Component files, token files, and Storybook"
          icon={<GithubIcon />}
          status={githubConnected ? "connected" : "idle"}
          onConnect={() => { window.location.href = "/api/auth/github/start"; }}
        >
          {githubConnected && (
            <div className="mt-4 pt-4 border-t border-line">
              <label className="text-[12.5px] text-gray block mb-1.5">
                Repository (owner/repo)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={repoInput}
                  onChange={(e) => { setRepoInput(e.target.value); setRepoSaved(false); }}
                  placeholder="acme/design-system"
                  className="flex-1 text-[13px] rounded-xl border border-line px-3 py-2 outline-none focus:border-[#1C1C1A] bg-white"
                />
                <Button
                  variant={repoSaved ? "outline" : "dark"}
                  withArrow={false}
                  onClick={saveRepo}
                  disabled={savingRepo || !repoInput.trim()}
                  className="text-[13px] flex-shrink-0"
                >
                  {savingRepo ? "Saving…" : repoSaved ? "Saved" : "Save"}
                </Button>
              </div>
            </div>
          )}
        </SourceCard>
      </div>

      {fieldError && (
        <p className="text-[12px] text-[#B91C1C] mt-3">{fieldError}</p>
      )}

      <Button
        variant="dark"
        className="justify-center w-full mt-8"
        disabled={!bothReady}
        onClick={() => router.push("/scan")}
      >
        Run scan
      </Button>
      {!bothReady && (
        <p className="text-[12px] text-gray text-center mt-3">
          {!figmaConnected && !githubConnected
            ? "Connect both sources to continue."
            : !figmaConnected
            ? "Connect Figma to continue."
            : !githubConnected
            ? "Connect GitHub to continue."
            : !fileKeySaved
            ? "Save your Figma file to continue."
            : "Save your GitHub repository to continue."}
        </p>
      )}
      <div className="text-center mt-4">
        <button
          onClick={() => router.push("/dashboard")}
          className="text-[12px] text-gray hover:text-[#1C1C1A] transition-colors underline underline-offset-2"
        >
          Skip for now — explore with demo data
        </button>
      </div>
    </div>
  );
}

function isNotConfiguredError(code: string): boolean {
  return code === "figma_not_configured" || code === "github_not_configured";
}

function errorMessage(code: string): string {
  const map: Record<string, string> = {
    figma_denied: "You declined the Figma authorization. Click Connect to try again.",
    figma_not_configured: "Figma integration is not available yet. You can continue with sample data for now.",
    figma_state_mismatch: "Something went wrong verifying the Figma connection. Please try connecting again.",
    figma_token_exchange_failed: "Failed to connect Figma. Please try again.",
    github_denied: "You declined the GitHub authorization. Click Connect to try again.",
    github_not_configured: "GitHub integration is not available yet. You can continue with sample data for now.",
    github_state_mismatch: "Something went wrong verifying the GitHub connection. Please try connecting again.",
    github_token_exchange_failed: "Failed to connect GitHub. Please try again.",
  };
  return map[code] ?? `Something went wrong (${code}). Please try again.`;
}
