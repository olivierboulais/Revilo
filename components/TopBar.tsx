"use client";

import { useState } from "react";
import { Logo } from "@/components/Logo";

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function TopBar({ workspaceName, scannedAt }: { workspaceName: string; scannedAt: string }) {
  const [lastScannedAt] = useState(scannedAt);

  return (
    <header
      className="h-14 sm:h-16 flex items-center justify-between pl-4 pr-3 sm:pl-6 sm:pr-4 sticky top-2 sm:top-4 z-10 rounded-full"
      style={{
        background: "var(--glass)",
        backdropFilter: "blur(20px)",
        border: "1px solid var(--line)",
        boxShadow: "0 8px 30px rgba(28,28,26,0.06)",
      }}
    >
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <span className="text-[13px] sm:text-[14px] font-medium truncate">{workspaceName}</span>
        <span className="w-1 h-1 rounded-full bg-line hidden sm:block" />
        <span className="text-[11px] sm:text-[12px] text-gray items-center gap-1.5 flex-shrink-0 hidden sm:flex">
          <span className="w-1.5 h-1.5 rounded-full bg-good" />
          Last scan {timeAgo(lastScannedAt)}
        </span>
      </div>
      <Logo width={72} height={22} />
    </header>
  );
}
