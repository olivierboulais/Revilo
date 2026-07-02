"use client";

import { useDrawer } from "@/components/DrawerContext";

export function EmptySourcesState({ page }: { page: string }) {
  const { open } = useDrawer();
  return (
    <div className="rounded-2xl border border-line bg-white p-8 sm:p-12 flex flex-col items-center text-center">
      <div className="w-14 h-14 rounded-2xl bg-[#F3E8FF] flex items-center justify-center mb-4">
        <svg width="24" height="24" viewBox="0 0 16 16" fill="none">
          <circle cx="4.5" cy="4.5" r="2" stroke="#7C3AED" strokeWidth="1.4" />
          <circle cx="11.5" cy="11.5" r="2" stroke="#7C3AED" strokeWidth="1.4" />
          <path d="M6 6L10 10" stroke="#7C3AED" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      </div>
      <h2 className="text-[15px] font-semibold tracking-tight mb-1.5">No data yet</h2>
      <p className="text-[13px] text-gray max-w-[340px] mb-5">
        Connect your Figma and GitHub accounts to see {page} data from your real design system.
      </p>
      <button
        onClick={open}
        className="inline-flex items-center gap-2 text-[13px] font-medium px-5 py-2.5 rounded-full text-[#1C1C1A]"
        style={{ background: "linear-gradient(135deg, #F3E8FF 0%, #E9D5FF 50%, #DDD6FE 100%)" }}
      >
        Connect sources
      </button>
    </div>
  );
}
