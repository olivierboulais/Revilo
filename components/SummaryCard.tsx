"use client";

import { useEffect, useState, useRef } from "react";
import { RingChart } from "@/components/RingChart";

function useCountUp(target: number, duration = 800) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (hasAnimated.current) return;
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          observer.disconnect();
          const start = performance.now();
          function tick(now: number) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setValue(Math.round(eased * target));
            if (progress < 1) requestAnimationFrame(tick);
          }
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration]);

  return { value, ref };
}

function InfoTooltip({ lines }: { lines: string[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  return (
    <div ref={ref} className="relative inline-flex items-center">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-[18px] h-[18px] rounded-full bg-[#F3F1EC] hover:bg-[#E8E5DF] flex items-center justify-center text-gray hover:text-[#1C1C1A] transition-colors flex-shrink-0"
        aria-label="Learn how this score is calculated"
      >
        <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
          <path d="M5 4.5v3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
          <circle cx="5" cy="3" r="0.75" fill="currentColor"/>
        </svg>
      </button>
      {open && (
        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 w-72 bg-[#1C1C1A] text-white rounded-xl px-4 py-3 shadow-xl z-50 text-left">
          {/* Arrow pointing left */}
          <div className="absolute right-full top-1/2 -translate-y-1/2 w-0 h-0 border-t-[6px] border-b-[6px] border-r-[6px] border-t-transparent border-b-transparent border-r-[#1C1C1A]" />
          <div className="flex flex-col gap-2">
            {lines.map((line, i) => (
              <p key={i} className="text-[11.5px] leading-relaxed opacity-90">{line}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function SummaryCard({
  label,
  value,
  suffix = "/100",
  locked = false,
  helperText,
  tooltip,
}: {
  label: string;
  value: number;
  suffix?: string;
  locked?: boolean;
  helperText?: string;
  tooltip?: string[];
}) {
  const counter = useCountUp(value);

  return (
    <div ref={counter.ref} className="rounded-2xl border border-line bg-white p-6 flex items-center gap-4">
      {locked ? (
        <div className="w-[72px] h-[72px] rounded-full flex items-center justify-center bg-[#F3F1EC] flex-shrink-0">
          <svg width="18" height="18" viewBox="0 0 14 14" fill="none" className="text-gray">
            <rect x="3" y="6" width="8" height="6" rx="1.2" stroke="currentColor" strokeWidth="1.3" />
            <path d="M4.5 6V4.5a2.5 2.5 0 0 1 5 0V6" stroke="currentColor" strokeWidth="1.3" />
          </svg>
        </div>
      ) : (
        <RingChart value={value} />
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 mb-1">
          <div className="text-[11.5px] uppercase tracking-wide text-gray">{label}</div>
          {tooltip && <InfoTooltip lines={tooltip} />}
        </div>
        {locked ? (
          <div className="text-[13px] text-gray">Unlock to view</div>
        ) : (
          <>
            <div className="text-[20px] font-semibold tracking-tight leading-none">
              {counter.value}
              <span className="text-[13px] text-gray font-normal">{suffix}</span>
            </div>
            {helperText && <div className="text-[11.5px] text-gray mt-1">{helperText}</div>}
          </>
        )}
      </div>
    </div>
  );
}

export function SummaryStatCard({
  label,
  value,
  helperText,
  accent,
  tooltip,
}: {
  label: string;
  value: string | number;
  helperText?: string;
  accent?: string;
  tooltip?: string[];
}) {
  const numValue = typeof value === "number" ? value : parseInt(value, 10);
  const isNum = !isNaN(numValue);
  const counter = useCountUp(isNum ? numValue : 0);

  return (
    <div ref={counter.ref} className="rounded-2xl border border-line bg-white p-6">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <span className="text-[11.5px] uppercase tracking-wide text-gray">{label}</span>
          {tooltip && <InfoTooltip lines={tooltip} />}
        </div>
        <span className="w-8 h-8 rounded-lg bg-[#F8F7F4] flex items-center justify-center text-[#1C1C1A]/60 flex-shrink-0">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M2 13.5L6 7.5L9.5 10L14 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </div>
      <div className="text-[28px] font-semibold tracking-tight leading-none" style={accent ? { color: accent } : undefined}>
        {isNum ? counter.value : value}
      </div>
      {helperText && <div className="text-[11.5px] text-gray mt-2">{helperText}</div>}
    </div>
  );
}
