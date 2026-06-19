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

export function TopBar({ workspaceName, scannedAt, email }: { workspaceName: string; scannedAt: string; email: string }) {
  const router = useRouter();
  const [isRescanning, setIsRescanning] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleRescan() {
    setIsRescanning(true);
    try {
      await fetch("/api/scan", { method: "POST" });
      router.refresh();
    } finally {
      setIsRescanning(false);
    }
  }

  return (
    <header
      className="h-16 flex items-center justify-between px-6 sticky top-4 z-10 rounded-full"
      style={{
        background: "var(--glass)",
        backdropFilter: "blur(20px)",
        border: "1px solid var(--line)",
        boxShadow: "0 8px 30px rgba(28,28,26,0.06)",
      }}
    >
      <div className="flex items-center gap-3 min-w-0">
        <span className="text-[14px] font-medium truncate">{workspaceName}</span>
        <span className="w-1 h-1 rounded-full bg-line" />
        <span className="text-[12px] text-gray flex items-center gap-1.5 flex-shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-good" />
          Last scan {timeAgo(scannedAt)}
        </span>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        <button
          onClick={handleRescan}
          disabled={isRescanning}
          className="text-[12.5px] font-medium px-3 py-1.5 rounded-full border border-line bg-white hover:bg-black/[0.03] transition-colors disabled:opacity-50 flex items-center gap-1.5"
        >
          {isRescanning ? (
            <>
              <span className="w-3 h-3 rounded-full border-2 border-line border-t-lilac-deep animate-spin" />
              Scanning…
            </>
          ) : (
            <>
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                <path d="M2 7C2 4.2 4.2 2 7 2C8.8 2 10.4 2.9 11.3 4.3M12 7C12 9.8 9.8 12 7 12C5.2 12 3.6 11.1 2.7 9.7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                <path d="M11.3 1.8V4.3H8.8M2.7 12.2V9.7H5.2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Rescan
            </>
          )}
        </button>
        <div className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="w-8 h-8 rounded-full bg-lilac flex items-center justify-center text-[12px] font-medium"
          >
            {email.charAt(0).toUpperCase()}
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-10 w-48 bg-white border border-line rounded-xl shadow-lg py-1.5 z-20">
              <div className="px-3.5 py-2 text-[12px] text-gray truncate border-b border-line mb-1">{email}</div>
              <form action="/api/logout" method="POST">
                <button type="submit" className="w-full text-left px-3.5 py-2 text-[13px] hover:bg-black/[0.03]">
                  Log out
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
