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

export function SummaryCard({
  label,
  value,
  suffix = "/100",
  locked = false,
  helperText,
}: {
  label: string;
  value: number;
  suffix?: string;
  locked?: boolean;
  helperText?: string;
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
      <div className="min-w-0">
        <div className="text-[11.5px] uppercase tracking-wide text-gray mb-1">{label}</div>
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

export function SummaryStatCard({ label, value, helperText, accent }: { label: string; value: string | number; helperText?: string; accent?: string }) {
  const numValue = typeof value === "number" ? value : parseInt(value, 10);
  const isNum = !isNaN(numValue);
  const counter = useCountUp(isNum ? numValue : 0);

  return (
    <div ref={counter.ref} className="rounded-2xl border border-line bg-white p-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11.5px] uppercase tracking-wide text-gray">{label}</span>
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
