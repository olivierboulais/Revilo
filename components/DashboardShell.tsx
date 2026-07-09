"use client";

import { useState, Suspense, createContext, useContext } from "react";
import { Sidebar } from "@/components/Sidebar";
import { MobileNav } from "@/components/MobileNav";
import { ConnectDrawer } from "@/components/ConnectDrawer";
import { DrawerProvider } from "@/components/DrawerContext";
import { ScanDrawer } from "@/components/ScanDrawer";

const ScanContext = createContext<{ openScan: () => void }>({ openScan: () => {} });
export function useScan() { return useContext(ScanContext); }

export function DashboardShell({
  workspaceName,
  isPaid,
  email,
  tier,
  figmaConnected,
  figmaFileKey,
  githubConnected,
  githubRepo,
  children,
}: {
  workspaceName: string;
  isPaid: boolean;
  email: string;
  tier: string;
  figmaConnected: boolean;
  figmaFileKey: string | null;
  githubConnected: boolean;
  githubRepo: string | null;
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [scanOpen, setScanOpen] = useState(false);

  return (
    <ScanContext.Provider value={{ openScan: () => setScanOpen(true) }}>
    <DrawerProvider>
    <div className="flex min-h-screen bg-[#F8F7F4] p-2 pb-24 sm:p-4 sm:pb-4 gap-2 sm:gap-4">
      <Sidebar
        workspaceName={workspaceName}
        isPaid={isPaid}
        email={email}
        tier={tier}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
      />
      {children}
      <MobileNav />

      <Suspense>
        <ConnectDrawer
          figmaConnected={figmaConnected}
          figmaFileKey={figmaFileKey}
          githubConnected={githubConnected}
          githubRepo={githubRepo}
          onStartScan={() => setScanOpen(true)}
        />
      </Suspense>

      <ScanDrawer
        workspaceName={workspaceName}
        open={scanOpen}
        onClose={() => setScanOpen(false)}
        onOpen={() => setScanOpen(true)}
      />
    </div>
    </DrawerProvider>
    </ScanContext.Provider>
  );
}
