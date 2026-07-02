"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ConnectFlow } from "@/components/ConnectFlow";

interface Props {
  figmaConnected: boolean;
  figmaFileKey: string | null;
  githubConnected: boolean;
  githubRepo: string | null;
}

export function ConnectDrawer({ figmaConnected, figmaFileKey, githubConnected, githubRepo }: Props) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const open = searchParams.get("connect") === "1";
  const overlayRef = useRef<HTMLDivElement>(null);
  const refreshed = useRef(false);

  const error = searchParams.get("error") ?? undefined;
  const errorDetail = searchParams.get("detail") ?? undefined;

  function close() {
    refreshed.current = false;
    const params = new URLSearchParams(searchParams.toString());
    params.delete("connect");
    params.delete("error");
    params.delete("detail");
    const qs = params.toString();
    router.replace(qs ? `?${qs}` : window.location.pathname);
  }

  // Re-fetch server data each time the drawer opens so the connected status
  // reflects what was just saved by the OAuth callback.
  useEffect(() => {
    if (!open) return;
    if (!refreshed.current) {
      refreshed.current = true;
      router.refresh();
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      {/* Backdrop */}
      <div
        ref={overlayRef}
        onClick={close}
        className={`fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px] transition-opacity duration-200 ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full z-50 w-full max-w-[520px] bg-[#F8F7F4] shadow-2xl flex flex-col transition-transform duration-300 ease-out ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-line flex-shrink-0">
          <span className="text-[14px] font-medium">Connect sources</span>
          <button
            onClick={close}
            className="w-8 h-8 rounded-full hover:bg-black/[0.06] flex items-center justify-center transition-colors"
            aria-label="Close"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-8 flex justify-center">
          <ConnectFlow
            figmaConnected={figmaConnected}
            figmaFileKey={figmaFileKey}
            githubConnected={githubConnected}
            githubRepo={githubRepo}
            error={error}
            errorDetail={errorDetail}
            onBothReady={() => router.push("/scan")}
            onClose={close}
          />
        </div>
      </div>
    </>
  );
}
