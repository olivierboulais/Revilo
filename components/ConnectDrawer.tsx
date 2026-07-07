"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ConnectFlow } from "@/components/ConnectFlow";
import { UpgradeContent } from "@/components/UpgradeContent";
import { useDrawer } from "@/components/DrawerContext";

interface Props {
  figmaConnected: boolean;
  figmaFileKey: string | null;
  githubConnected: boolean;
  githubRepo: string | null;
}

export function ConnectDrawer({ figmaConnected, figmaFileKey, githubConnected, githubRepo }: Props) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isOpen: stateOpen, tab, setTab, close: closeState } = useDrawer();

  const urlOpen = searchParams.get("connect") === "1";
  const open = stateOpen || urlOpen;

  const overlayRef = useRef<HTMLDivElement>(null);
  const error = searchParams.get("error") ?? undefined;
  const errorDetail = searchParams.get("detail") ?? undefined;

  function close() {
    closeState();
    if (urlOpen) {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("connect");
      params.delete("error");
      params.delete("detail");
      const qs = params.toString();
      router.replace(qs ? `?${qs}` : window.location.pathname);
    }
  }

  useEffect(() => {
    if (!open) return;
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
        className={`fixed top-0 right-0 h-full z-50 w-full max-w-[520px] bg-surface shadow-2xl flex flex-col transition-transform duration-300 ease-out ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-line flex-shrink-0">
          {/* Tabs */}
          <div className="flex items-center gap-1 bg-line/30 rounded-full p-1">
            {(["connect", "upgrade"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`text-[12.5px] font-medium px-4 py-1.5 rounded-full transition-colors capitalize ${
                  tab === t
                    ? "bg-card text-foreground shadow-sm"
                    : "text-gray hover:text-foreground"
                }`}
              >
                {t === "connect" ? "Connect" : "Upgrade"}
              </button>
            ))}
          </div>
          <button
            onClick={close}
            className="w-8 h-8 rounded-full hover:bg-foreground/[0.07] flex items-center justify-center transition-colors"
            aria-label="Close"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-8 flex justify-center">
          {tab === "connect" ? (
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
          ) : (
            <UpgradeContent onClose={close} />
          )}
        </div>
      </div>
    </>
  );
}
