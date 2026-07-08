"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { SCAN_PROGRESS_SEQUENCE } from "@/lib/types";

const STEP_DURATION_MS = 850;

// ─── Shared keyframes ────────────────────────────────────────────────────────
const KEYFRAMES = `
  @keyframes floatA { 0%,100%{transform:translateY(0px) rotate(-6deg)} 50%{transform:translateY(-8px) rotate(-3deg)} }
  @keyframes floatB { 0%,100%{transform:translateY(0px) rotate(5deg)} 50%{transform:translateY(-6px) rotate(2deg)} }
  @keyframes ping2  { 0%{transform:scale(1);opacity:.6} 100%{transform:scale(2.4);opacity:0} }
  @keyframes popIn  { 0%{transform:scale(0) rotate(-15deg)} 70%{transform:scale(1.15) rotate(3deg)} 100%{transform:scale(1) rotate(0deg)} }
  @keyframes fadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  @keyframes shake  { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-6px)} 40%{transform:translateX(6px)} 60%{transform:translateX(-4px)} 80%{transform:translateX(4px)} }
  @keyframes sparkle { 0%{transform:scale(0) translate(0,0);opacity:1} 100%{transform:scale(1) translate(var(--tx),var(--ty));opacity:0} }
  @keyframes errorPulse { 0%,100%{box-shadow:0 0 0 0 rgba(239,68,68,.0)} 50%{box-shadow:0 0 0 10px rgba(239,68,68,.08)} }
`;

// ─── Card shapes shared across states ────────────────────────────────────────
function FigmaCard({ borderColor, bgColor, animName }: { borderColor: string; bgColor: string; animName?: string }) {
  return (
    <div className="flex flex-col gap-1 p-3 rounded-xl border-2 shadow-sm"
      style={{ width: 76, background: "#fff", borderColor, animation: animName }}>
      <div className="rounded-md" style={{ height: 28, background: bgColor, transition: "background .5s" }} />
      <div className="rounded" style={{ height: 7, width: "70%", background: "#E5E3DF" }} />
      <div className="rounded" style={{ height: 7, width: "50%", background: "#E5E3DF" }} />
    </div>
  );
}

function CodeCard({ borderColor, lineColor, animName }: { borderColor: string; lineColor: string; animName?: string }) {
  return (
    <div className="flex flex-col gap-1 p-3 rounded-xl border-2 shadow-sm"
      style={{ width: 76, background: "#1C1C1A", borderColor, animation: animName }}>
      <div className="rounded" style={{ height: 7, width: "80%", background: lineColor, marginBottom: 2, transition: "background .5s" }} />
      <div className="rounded" style={{ height: 7, width: "60%", background: "#444" }} />
      <div className="rounded" style={{ height: 7, width: "90%", background: "#444" }} />
      <div className="rounded" style={{ height: 7, width: "50%", background: "#444" }} />
    </div>
  );
}

// ─── Scanning state graphic ───────────────────────────────────────────────────
function ScanningGraphic({ stepIndex }: { stepIndex: number }) {
  const total = SCAN_PROGRESS_SEQUENCE.length;
  const progress = Math.min((stepIndex / total) * 100, 100);
  return (
    <div className="relative flex items-center justify-center select-none" style={{ width: 220, height: 200 }}>
      <style>{KEYFRAMES}</style>

      <div className="absolute" style={{ left: 8, top: 44, animation: "floatA 3.2s ease-in-out infinite" }}>
        <FigmaCard
          borderColor={stepIndex > 2 ? "#C084FC" : "#E5E3DF"}
          bgColor={stepIndex > 2 ? "#F3E8FF" : "#F0EFEC"}
        />
      </div>

      <div className="absolute" style={{ right: 8, top: 52, animation: "floatB 3.6s ease-in-out infinite" }}>
        <CodeCard
          borderColor={stepIndex > 3 ? "#C084FC" : "#333"}
          lineColor={stepIndex > 3 ? "#C084FC" : "#444"}
        />
      </div>

      <div className="absolute flex items-center justify-center" style={{ bottom: 32, left: "50%", transform: "translateX(-50%)" }}>
        <div className="relative flex items-center justify-center">
          <div className="w-9 h-9 rounded-full border-2 border-[#C084FC] flex items-center justify-center" style={{ background: "#F3E8FF" }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="animate-spin" style={{ animationDuration: "1.5s" }}>
              <path d="M3 8a5 5 0 0 1 8.66-2.5" stroke="#C084FC" strokeWidth="2" strokeLinecap="round"/>
              <path d="M13 8a5 5 0 0 1-8.66 2.5" stroke="#C084FC" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="absolute w-9 h-9 rounded-full border border-[#C084FC]" style={{ animation: "ping2 1.4s ease-out infinite" }} />
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-1 rounded-full overflow-hidden" style={{ background: "rgba(28,28,26,.07)" }}>
        <div className="h-full rounded-full transition-all duration-700"
          style={{ width: `${progress}%`, background: "linear-gradient(to right, #C084FC, #818CF8)" }} />
      </div>
    </div>
  );
}

// ─── Success state graphic ────────────────────────────────────────────────────
const SPARKLE_POSITIONS = [
  { tx: "-38px", ty: "-32px" }, { tx: "38px", ty: "-32px" },
  { tx: "-52px", ty: "8px" },  { tx: "52px", ty: "8px" },
  { tx: "-28px", ty: "36px" }, { tx: "28px", ty: "36px" },
  { tx: "0px",   ty: "-48px" },
];
const SPARKLE_COLORS = ["#34D399", "#6EE7B7", "#A7F3D0", "#C084FC", "#34D399", "#6EE7B7", "#34D399"];

function SuccessGraphic() {
  return (
    <div className="relative flex flex-col items-center justify-center select-none" style={{ width: 220, height: 200 }}>
      <style>{KEYFRAMES}</style>

      {/* Cards side by side, snapped together */}
      <div className="flex items-center gap-2 mb-4" style={{ animation: "fadeUp .5s ease both" }}>
        <FigmaCard borderColor="#34D399" bgColor="#D1FAE5" />
        <CodeCard borderColor="#34D399" lineColor="#34D399" />
      </div>

      {/* Big check + sparkles */}
      <div className="relative flex items-center justify-center">
        {SPARKLE_POSITIONS.map((pos, i) => (
          <span key={i} className="absolute w-2 h-2 rounded-full"
            style={{
              background: SPARKLE_COLORS[i],
              ["--tx" as string]: pos.tx,
              ["--ty" as string]: pos.ty,
              animation: `sparkle .6s cubic-bezier(.2,1,.4,1) ${i * 40}ms both`,
            }} />
        ))}
        <div style={{ animation: "popIn .45s cubic-bezier(.34,1.56,.64,1) .1s both" }}>
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <circle cx="20" cy="20" r="20" fill="#34D399" />
            <path d="M11 20l7 7 11-11" stroke="white" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </div>
  );
}

// ─── Error state graphic ──────────────────────────────────────────────────────
function ErrorGraphic() {
  return (
    <div className="relative flex flex-col items-center justify-center select-none" style={{ width: 220, height: 200 }}>
      <style>{KEYFRAMES}</style>

      {/* Cards drifted apart */}
      <div className="flex items-center gap-6 mb-4" style={{ animation: "fadeUp .4s ease both" }}>
        <div style={{ transform: "rotate(-8deg) translateX(-4px)" }}>
          <FigmaCard borderColor="#FCA5A5" bgColor="#FEE2E2" />
        </div>
        <div style={{ transform: "rotate(8deg) translateX(4px)" }}>
          <CodeCard borderColor="#F87171" lineColor="#F87171" />
        </div>
      </div>

      {/* X icon */}
      <div style={{ animation: "popIn .4s cubic-bezier(.34,1.56,.64,1) .1s both" }}>
        <div className="relative flex items-center justify-center rounded-full"
          style={{ width: 40, height: 40, background: "#EF4444", animation: "errorPulse 2s ease infinite" }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M3 3l10 10M13 3L3 13" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
        </div>
      </div>
    </div>
  );
}

// ─── Main drawer ──────────────────────────────────────────────────────────────
type Phase = "scanning" | "success" | "error";

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
  const [phase, setPhase] = useState<Phase>("scanning");
  const [scanError, setScanError] = useState<string | null>(null);
  const [scanDest, setScanDest] = useState("/dashboard");
  const hasStarted = useRef(false);

  // Reset on close
  useEffect(() => {
    if (!open) {
      hasStarted.current = false;
      setStepIndex(0);
      setPhase("scanning");
      setScanError(null);
      setScanDest("/dashboard");
    }
  }, [open]);

  // Kick off scan
  useEffect(() => {
    if (!open || hasStarted.current) return;
    hasStarted.current = true;

    fetch("/api/scan", { method: "POST" })
      .then(async (res) => {
        if (!res.ok) {
          const msg = res.status === 401
            ? "Not authenticated — please log in again."
            : `Scan failed (${res.status}). Please try again.`;
          setScanError(msg);
          setPhase("error");
          return;
        }
        const data = await res.json();
        const params = new URLSearchParams();
        if (data.dataSource?.figma === "error") params.set("figma_error", data.dataSource.figmaError || "unknown");
        if (data.dataSource?.github === "error") params.set("github_error", data.dataSource.githubError || "unknown");
        setScanDest(`/dashboard${params.toString() ? "?" + params.toString() : ""}`);
        // Wait for step animation to finish, then show success
        const stepsLeft = (SCAN_PROGRESS_SEQUENCE.length - stepIndex) * STEP_DURATION_MS;
        setTimeout(() => setPhase("success"), Math.max(stepsLeft, 0));
      })
      .catch((err) => {
        setScanError(err instanceof Error ? err.message : "Network error. Please try again.");
        setPhase("error");
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Step ticker
  useEffect(() => {
    if (!open || phase !== "scanning") return;
    if (stepIndex >= SCAN_PROGRESS_SEQUENCE.length) return;
    const timer = setTimeout(() => setStepIndex((i) => i + 1), STEP_DURATION_MS);
    return () => clearTimeout(timer);
  }, [open, stepIndex, phase]);

  // Esc to close when not scanning
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) { if (e.key === "Escape" && phase !== "scanning") onClose(); }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, phase, onClose]);

  function handleViewReport() {
    router.push(scanDest);
    router.refresh();
    onClose();
  }

  function handleRetry() {
    hasStarted.current = false;
    setStepIndex(0);
    setPhase("scanning");
    setScanError(null);
  }

  const headerLabel =
    phase === "success" ? "Scan complete!" :
    phase === "error"   ? "Scan failed" :
    `Scanning ${workspaceName}`;

  const canClose = phase !== "scanning";

  return (
    <>
      <div className={`fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px] transition-opacity duration-200 ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`} />

      <div className={`fixed top-0 right-0 h-full z-50 w-full max-w-[520px] bg-surface shadow-2xl flex flex-col transition-transform duration-300 ease-out ${open ? "translate-x-0" : "translate-x-full"}`}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-line flex-shrink-0">
          <span className="text-[13.5px] font-medium">{headerLabel}</span>
          {canClose && (
            <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-foreground/[0.07] flex items-center justify-center transition-colors" aria-label="Close">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col px-8 py-8 overflow-y-auto">

          {/* ── SUCCESS ── */}
          {phase === "success" && (
            <div className="flex flex-col items-center text-center gap-4 py-8" style={{ animation: "fadeUp .4s ease both" }}>
              <SuccessGraphic />
              <h2 className="text-[20px] font-semibold mt-2">Your report is ready</h2>
              <p className="text-[13px] text-gray max-w-[280px]">
                We&apos;ve analysed your design system. Head to the dashboard to see what we found.
              </p>
              <button
                onClick={handleViewReport}
                className="mt-2 btn-dark inline-flex items-center gap-[9px] rounded-full pl-[18px] pr-2 py-[9px] text-[13px] font-medium hover:scale-[1.02] transition-transform"
              >
                View report
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white">
                  <svg width="12" height="12" viewBox="0 0 13 13" fill="none"><path d="M1.5 11.5L11.5 1.5M11.5 1.5H3.5M11.5 1.5V9.5" stroke="#1C1C1A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </span>
              </button>
            </div>
          )}

          {/* ── ERROR ── */}
          {phase === "error" && (
            <div className="flex flex-col items-center text-center gap-4 py-8" style={{ animation: "fadeUp .4s ease both" }}>
              <ErrorGraphic />
              <h2 className="text-[20px] font-semibold mt-2">Something went wrong</h2>
              <p className="text-[13px] text-gray max-w-[280px]">{scanError}</p>
              <div className="flex gap-3 mt-2">
                <button
                  onClick={handleRetry}
                  className="btn-dark inline-flex items-center gap-[9px] rounded-full pl-[18px] pr-2 py-[9px] text-[13px] font-medium hover:scale-[1.02] transition-transform"
                >
                  Try again
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white">
                    <svg width="12" height="12" viewBox="0 0 13 13" fill="none"><path d="M1.5 11.5L11.5 1.5M11.5 1.5H3.5M11.5 1.5V9.5" stroke="#1C1C1A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </span>
                </button>
                <button
                  onClick={onClose}
                  className="inline-flex items-center rounded-full px-[18px] py-[11px] text-[13px] font-medium border border-line hover:bg-foreground/[0.05] transition-colors"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}

          {/* ── SCANNING ── */}
          {phase === "scanning" && (
            <>
              <div className="flex flex-col items-center justify-center py-8 mb-4">
                <ScanningGraphic stepIndex={stepIndex} />
                <p className="text-[13px] text-gray mt-6 text-center">Analysing your design system…</p>
              </div>

              {/* Step checklist */}
              <div className="mt-4 flex flex-col">
                {SCAN_PROGRESS_SEQUENCE.map((step, i) => {
                  const isDone   = i < stepIndex;
                  const isActive = i === stepIndex;
                  const isLast   = i === SCAN_PROGRESS_SEQUENCE.length - 1;
                  return (
                    <div key={step.state}>
                      <div className="flex items-center gap-4 py-3">
                        {/* Circle indicator */}
                        {isDone ? (
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="flex-shrink-0">
                            <circle cx="12" cy="12" r="12" fill="#34D399"/>
                            <path d="M7 12l3.5 3.5L17 9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        ) : isActive ? (
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="flex-shrink-0">
                            <circle cx="12" cy="12" r="11" stroke="#C084FC" strokeWidth="1.5" strokeDasharray="4 3"/>
                            <circle cx="12" cy="12" r="4" fill="#C084FC" className="animate-pulse"/>
                          </svg>
                        ) : (
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="flex-shrink-0">
                            <circle cx="12" cy="12" r="11" stroke="rgba(28,28,26,.15)" strokeWidth="1.5" strokeDasharray="4 3"/>
                          </svg>
                        )}

                        {/* Label */}
                        <span
                          className="flex-1 text-[14px] transition-colors duration-300"
                          style={{
                            color: isDone ? "rgba(28,28,26,.35)" : isActive ? "#1C1C1A" : "rgba(28,28,26,.3)",
                            fontWeight: isActive ? 500 : 400,
                          }}
                        >
                          {step.label}
                        </span>
                      </div>
                      {!isLast && <div style={{ height: 1, background: "rgba(28,28,26,.06)", marginLeft: 40 }} />}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
