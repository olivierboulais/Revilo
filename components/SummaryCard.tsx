import { RingChart } from "@/components/RingChart";

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
  return (
    <div className="rounded-2xl border border-line bg-white p-5 flex items-center gap-4">
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
              {value}
              <span className="text-[13px] text-gray font-normal">{suffix}</span>
            </div>
            {helperText && <div className="text-[11.5px] text-gray mt-1">{helperText}</div>}
          </>
        )}
      </div>
    </div>
  );
}

// A simpler numeric variant for non-score metrics (e.g. "Issues Found: 19")
// where a ring chart doesn't make sense.
export function SummaryStatCard({ label, value, helperText, accent }: { label: string; value: string | number; helperText?: string; accent?: string }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-5">
      <div className="text-[11.5px] uppercase tracking-wide text-gray mb-2">{label}</div>
      <div className="text-[28px] font-semibold tracking-tight leading-none" style={accent ? { color: accent } : undefined}>
        {value}
      </div>
      {helperText && <div className="text-[11.5px] text-gray mt-2">{helperText}</div>}
    </div>
  );
}
