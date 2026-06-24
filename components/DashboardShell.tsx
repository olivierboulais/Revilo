"use client";

import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";

export function DashboardShell({
  workspaceName,
  isPaid,
  email,
  tier,
  children,
}: {
  workspaceName: string;
  isPaid: boolean;
  email: string;
  tier: string;
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#F8F7F4] p-2 sm:p-4 gap-2 sm:gap-4">
      <button
        onClick={() => setSidebarOpen(true)}
        className="fixed bottom-4 left-4 z-30 lg:hidden w-12 h-12 rounded-full bg-[#1C1C1A] text-white flex items-center justify-center shadow-lg"
        aria-label="Open menu"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </button>

      <Sidebar
        workspaceName={workspaceName}
        isPaid={isPaid}
        email={email}
        tier={tier}
        mobileOpen={sidebarOpen}
        onMobileClose={() => setSidebarOpen(false)}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
      />
      {children}
    </div>
  );
}
