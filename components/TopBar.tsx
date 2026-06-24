"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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
  const router = useRouter();
  const [lastScannedAt, setLastScannedAt] = useState(scannedAt);
  const [scanning, setScanning] = useState(false);

  async function rescan() {
    setScanning(true);
    try {
      const res = await fetch("/api/scan", { method: "POST" });
      if (res.ok) {
        setLastScannedAt(new Date().toISOString());
        router.refresh();
      }
    } finally {
      setScanning(false);
    }
  }

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
      <button
        onClick={rescan}
        disabled={scanning}
        className="flex items-center gap-1.5 text-[12px] font-medium px-2.5 sm:px-3 py-1.5 rounded-full border border-line hover:bg-black/[0.03] transition-colors disabled:opacity-50"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className={scanning ? "animate-spin" : undefined}>
          <path d="M11.5 3.5A5.5 5.5 0 1 0 12.5 7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          <path d="M12.5 2V5H9.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="hidden sm:inline">{scanning ? "Scanning…" : "Re-scan"}</span>
      </button>
    </header>
  );
}
