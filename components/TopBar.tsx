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
        className="gradient-lilac flex items-center gap-2 text-[13px] font-medium px-4 sm:px-5 py-2 sm:py-2.5 rounded-full transition-colors disabled:opacity-50"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className={scanning ? "animate-spin" : undefined}>
          <path d="M3.5 8a4.5 4.5 0 0 1 7.6-3.3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M12.5 8a4.5 4.5 0 0 1-7.6 3.3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M11.5 2.5L11.1 5.2 8.5 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M4.5 13.5l.4-2.7 2.6.7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="hidden sm:inline">{scanning ? "Scanning…" : "Re-scan"}</span>
      </button>
    </header>
  );
}
