"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { SCAN_PROGRESS_SEQUENCE } from "@/lib/types";

const STEP_DURATION_MS = 850;

function ScanAnimation({ complete }: { complete: boolean }) {
  return (
    <div className="relative flex items-center justify-center" style={{ width: 160, height: 160 }}>
      {/* Outer rings */}
      <span className="absolute inset-0 rounded-full border border-foreground/[0.06]" />
      <span className="absolute rounded-full border border-foreground/[0.08]" style={{ inset: 16 }} />
      <span className="absolute rounded-full border border-foreground/[0.10]" style={{ inset: 32 }} />

      {/* Spinning arc */}
      {!complete && (
        <svg className="absolute inset-0 animate-spin" style={{ animationDuration: "2s" }} viewBox="0 0 160 160" fill="none">
          <circle cx="80" cy="80" r="72" stroke="url(#scanGrad)" strokeWidth="2" strokeLinecap="round" strokeDasharray="80 380" />
          <defs>
            <linearGradient id="scanGrad" x1="0" y1="0" x2="160" y2="160" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#C084FC" stopOpacity="0" />
              <stop offset="100%" stopColor="#C084FC" />
            </linearGradient>
          </defs>
        </svg>
      )}

      {/* Pulsing dot grid */}
      <div className="absolute grid gap-2" style={{ gridTemplateColumns: "repeat(3, 1fr)", inset: 48 }}>
        {Array.from({ length: 9 }).map((_, i) => (
          <span
            key={i}
            className="w-1.5 h-1.5 rounded-full"
            style={{
              background: complete ? "#34D399" : "#1C1C1A",
              opacity: complete ? 1 : 0.15 + (i % 3) * 0.15,
              animation: complete ? "none" : `pulse ${0.8 + (i % 3) * 0.3}s ease-in-out infinite alternate`,
              animationDelay: `${i * 0.1}s`,
            }}
          />
        ))}
      </div>

      <style>{`@keyframes pulse { from { opacity: 0.1; } to { opacity: 0.7; } }`}</style>
    </div>
  );
}

export function ScanDrawer({
  workspaceName,
  open,
  onClose,
}: {
  workspaceName: string;
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);
  const [scanError, setScanError] = useState<string | null>(null);
  const hasStarted = useRef(false);

  useEffect(() => {
    if (!open) {
      hasStarted.current = false;
      setStepIndex(0);
      setScanError(null);
      return;
    }
    if (hasStarted.current) return;
    hasStarted.current = true;

    fetch("/api/scan", { method: "POST" })
      .then(async (res) => {
        if (!res.ok) {
          const msg = res.status === 401
            ? "Not authenticated — please log in again."
            : `Scan failed (${res.status}). Please try again.`;
          setScanError(msg);
          return;
        }
        const data = await res.json();
        const params = new URLSearchParams();
        if (data.dataSource?.figma === "error") params.set("figma_error", data.dataSource.figmaError || "unknown");
        if (data.dataSource?.github === "error") params.set("github_error", data.dataSource.githubError || "unknown");
        const dest = `/dashboard${params.toString() ? "?" + params.toString() : ""}`;
        const remaining = SCAN_PROGRESS_SEQUENCE.length * STEP_DURATION_MS;
        setTimeout(() => {
          router.push(dest);
          router.refresh();
          onClose();
        }, remaining);
      })
      .catch((err) => {
        setScanError(err instanceof Error ? err.message : "Network error. Please try again.");
      });
  }, [open, router, onClose]);

  useEffect(() => {
    if (!open || scanError) return;
    if (stepIndex >= SCAN_PROGRESS_SEQUENCE.length) return;
    const timer = setTimeout(() => setStepIndex((i) => i + 1), STEP_DURATION_MS);
    return () => clearTimeout(timer);
  }, [open, stepIndex, scanError]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) { if (e.key === "Escape" && scanError) onClose(); }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, scanError, onClose]);

  const complete = stepIndex >= SCAN_PROGRESS_SEQUENCE.length;

  return (
    <>
      <div className={`fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px] transition-opacity duration-200 ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`} />

      <div className={`fixed top-0 right-0 h-full z-50 w-full max-w-[520px] bg-surface shadow-2xl flex flex-col transition-transform duration-300 ease-out ${open ? "translate-x-0" : "translate-x-full"}`}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-line flex-shrink-0">
          <span className="text-[13.5px] font-medium">Scanning {workspaceName}</span>
          {scanError && (
            <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-foreground/[0.07] flex items-center justify-center transition-colors" aria-label="Close">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col px-8 py-8 overflow-y-auto">
          {/* Animation */}
          <div className="flex flex-col items-center justify-center py-8 mb-4">
            <ScanAnimation complete={complete} />
            <p className="text-[13px] text-gray mt-6 text-center">
              {complete ? "Scan complete — loading your report…" : "Analysing your design system…"}
            </p>
          </div>

          {scanError && (
            <div className="mb-6 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-[13px] text-[#B91C1C] px-4 py-3">
              {scanError}
            </div>
          )}

          {/* Steps */}
          <div className="flex flex-col gap-4 mt-2">
            {SCAN_PROGRESS_SEQUENCE.map((step, i) => {
              const isDone = i < stepIndex || complete;
              const isActive = i === stepIndex && !complete;
              return (
                <div key={step.state} className="flex items-center gap-4">
                  <span
                    className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
                    style={{ background: isDone ? "#34D399" : isActive ? "#C084FC" : "rgba(28,28,26,.07)" }}
                  >
                    {isDone ? (
                      <svg width="11" height="11" viewBox="0 0 10 10" fill="none">
                        <path d="M1.5 5L4 7.5L8.5 2.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : isActive ? (
                      <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                    ) : null}
                  </span>
                  <span className={`text-[14px] transition-colors ${isDone ? "text-foreground" : isActive ? "text-foreground font-medium" : "text-gray"}`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
