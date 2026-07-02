"use client";

import { useState } from "react";
import { useDrawer } from "@/components/DrawerContext";

interface Props {
  figmaConnected: boolean;
  githubConnected: boolean;
}

export function MockDataBanner({ figmaConnected, githubConnected }: Props) {
  const [dismissed, setDismissed] = useState(false);
  const { open } = useDrawer();

  if (dismissed || (figmaConnected && githubConnected)) return null;

  const missing = [
    !figmaConnected && "Figma",
    !githubConnected && "GitHub",
  ].filter(Boolean).join(" and ");

  return (
    <div className="rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] px-4 py-3 flex items-center justify-between gap-4 text-[13px]">
      <span className="text-[#1E40AF]">
        This report uses <strong>sample data</strong> — {missing} {!figmaConnected && !githubConnected ? "are" : "is"} not connected yet.
      </span>
      <div className="flex items-center gap-3 flex-shrink-0">
        <button
          onClick={open}
          className="font-medium text-[#1E40AF] hover:underline"
        >
          Connect sources →
        </button>
        <button onClick={() => setDismissed(true)} className="text-[#3B82F6] hover:opacity-70" aria-label="Dismiss">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}
