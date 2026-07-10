"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function VerifiedToast() {
  const [visible, setVisible] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Strip ?verified=1 from the URL without a re-render
    const url = new URL(window.location.href);
    url.searchParams.delete("verified");
    window.history.replaceState(null, "", url.toString());

    const t = setTimeout(() => setVisible(false), 4000);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-24 right-4 lg:bottom-6 lg:right-6 z-50 flex items-center gap-3 rounded-full shadow-lg border bg-surface pl-4 pr-5 py-3 pointer-events-none"
      style={{ animation: "toastLife 4s ease forwards", borderColor: "#6EE7B7" }}
    >
      <style>{`
        @keyframes toastLife {
          0%   { opacity:0; transform:translateY(8px) }
          8%   { opacity:1; transform:translateY(0) }
          80%  { opacity:1; transform:translateY(0) }
          100% { opacity:0; transform:translateY(4px) }
        }
      `}</style>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="flex-shrink-0">
        <circle cx="12" cy="12" r="12" fill="#34D399"/>
        <path d="M7 12l3.5 3.5L17 9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      <div className="flex flex-col items-start leading-none gap-[3px]">
        <span className="text-[11px] font-medium text-foreground whitespace-nowrap">Email verified</span>
        <span className="text-[10px] text-gray">Your account is now fully active.</span>
      </div>
    </div>
  );
}
