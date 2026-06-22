"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { SCAN_PROGRESS_SEQUENCE } from "@/lib/types";

const STEP_DURATION_MS = 850;

export function ScanProgress({ workspaceName }: { workspaceName: string }) {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);
  const hasStartedApiCall = useRef(false);

  useEffect(() => {
    if (stepIndex >= SCAN_PROGRESS_SEQUENCE.length) return;
    const timer = setTimeout(() => setStepIndex((i) => i + 1), STEP_DURATION_MS);
    return () => clearTimeout(timer);
  }, [stepIndex]);

  useEffect(() => {
    // Kick off the real (mock) scan in parallel with the animation rather
    // than after it, so the perceived wait isn't animation time plus
    // network time stacked on top of each other.
    if (hasStartedApiCall.current) return;
    hasStartedApiCall.current = true;

    let redirected = false;
    fetch("/api/scan", { method: "POST" })
      .then((res) => {
        const dest = res.ok ? "/dashboard" : "/dashboard?scan_error=1";
        const remaining = SCAN_PROGRESS_SEQUENCE.length * STEP_DURATION_MS;
        setTimeout(() => {
          if (!redirected) {
            redirected = true;
            router.push(dest);
          }
        }, remaining);
      })
      .catch(() => {
        router.push("/dashboard?scan_error=1");
      });

    return () => {
      redirected = true;
    };
  }, [router]);

  const complete = stepIndex >= SCAN_PROGRESS_SEQUENCE.length;

  return (
    <div className="w-full max-w-[420px]">
      <h1 className="text-[22px] font-semibold tracking-tight mb-1">Scanning {workspaceName}</h1>
      <p className="text-[13.5px] text-gray mb-8">This usually takes a moment.</p>
      <div className="flex flex-col gap-3">
        {SCAN_PROGRESS_SEQUENCE.map((step, i) => {
          const isDone = i < stepIndex || complete;
          const isActive = i === stepIndex && !complete;
          return (
            <div key={step.state} className="flex items-center gap-3">
              <span className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-colors" style={{ background: isDone ? "#34D399" : isActive ? "#C084FC" : "rgba(28,28,26,.08)" }}>
                {isDone ? (
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M1.5 5L4 7.5L8.5 2.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : isActive ? (
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                ) : null}
              </span>
              <span className={`text-[13.5px] transition-colors ${isDone ? "text-[#1C1C1A]" : isActive ? "text-[#1C1C1A] font-medium" : "text-gray"}`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
