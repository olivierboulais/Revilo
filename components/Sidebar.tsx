"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

function IconOverview() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="1.5" y="1.5" width="6" height="6" rx="1.3" stroke="currentColor" strokeWidth="1.4" />
      <rect x="8.5" y="1.5" width="6" height="6" rx="1.3" stroke="currentColor" strokeWidth="1.4" />
      <rect x="1.5" y="8.5" width="6" height="6" rx="1.3" stroke="currentColor" strokeWidth="1.4" />
      <rect x="8.5" y="8.5" width="6" height="6" rx="1.3" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}
function IconAlignment() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M2 5L8 1.5L14 5L8 8.5L2 5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M2 9L8 12.5L14 9" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  );
}
function IconAdoption() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.4" />
      <path d="M8 4.5V8L10.5 9.8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}
function IconArchitecture() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 1.5L14 5V11L8 14.5L2 11V5L8 1.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M8 1.5V14.5" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}
function IconTeam() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="6" cy="5.5" r="2.2" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="11" cy="6.5" r="1.8" stroke="currentColor" strokeWidth="1.4" />
      <path d="M2 13C2 10.5 3.8 9 6 9C8.2 9 10 10.5 10 13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M10.5 9.3C12.2 9.6 13.5 10.9 13.5 13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}
function IconRecommendations() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 1.5C5.5 1.5 3.5 3.5 3.5 6C3.5 7.7 4.3 8.9 5.5 9.8V11.5H10.5V9.8C11.7 8.9 12.5 7.7 12.5 6C12.5 3.5 10.5 1.5 8 1.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M6 14H10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}
function IconSources() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="4.5" cy="4.5" r="2" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="11.5" cy="11.5" r="2" stroke="currentColor" strokeWidth="1.4" />
      <path d="M6 6L10 10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}
function IconSettings() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.4" />
      <path d="M8 1.5V3.2M8 12.8V14.5M14.5 8H12.8M3.2 8H1.5M12.6 3.4L11.4 4.6M4.6 11.4L3.4 12.6M12.6 12.6L11.4 11.4M4.6 4.6L3.4 3.4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}
function IconRescan({ spinning }: { spinning?: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className={spinning ? "animate-spin" : undefined}>
      <path d="M2 7C2 4.2 4.2 2 7 2C8.8 2 10.4 2.9 11.3 4.3M12 7C12 9.8 9.8 12 7 12C5.2 12 3.6 11.1 2.7 9.7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M11.3 1.8V4.3H8.8M2.7 12.2V9.7H5.2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconCollapse() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconExpand() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Overview", icon: <IconOverview /> },
  { href: "/dashboard/alignment", label: "Alignment", icon: <IconAlignment /> },
  { href: "/dashboard/adoption", label: "Adoption", icon: <IconAdoption /> },
  { href: "/dashboard/architecture", label: "Architecture", icon: <IconArchitecture /> },
  { href: "/dashboard/team-insights", label: "Team Insights", icon: <IconTeam /> },
  { href: "/dashboard/recommendations", label: "Recommendations", icon: <IconRecommendations /> },
  { href: "/dashboard/sources", label: "Sources", icon: <IconSources /> },
  { href: "/dashboard/settings", label: "Settings", icon: <IconSettings /> },
];

export function Sidebar({
  workspaceName,
  isPaid,
  email,
  mobileOpen,
  onMobileClose,
  collapsed,
  onToggleCollapse,
}: {
  workspaceName: string;
  isPaid: boolean;
  email: string;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isRescanning, setIsRescanning] = useState(false);

  async function handleRescan() {
    setIsRescanning(true);
    try {
      await fetch("/api/scan", { method: "POST" });
      router.refresh();
    } finally {
      setIsRescanning(false);
    }
  }

  const isCollapsed = collapsed && !mobileOpen;

  return (
    <>
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={onMobileClose} />
      )}
      <aside
        className={`flex-shrink-0 flex flex-col rounded-[28px] overflow-hidden transition-all duration-200
          fixed top-4 left-4 z-50 lg:sticky lg:top-4 lg:z-auto lg:translate-x-0
          ${mobileOpen ? "translate-x-0 w-[220px]" : isCollapsed ? "w-[68px]" : "w-[220px]"}
          ${!mobileOpen && !isCollapsed ? "" : ""}
          ${!mobileOpen && isCollapsed ? "lg:translate-x-0" : ""}
          ${!mobileOpen && !isCollapsed ? "lg:translate-x-0" : ""}
          ${!mobileOpen ? "-translate-x-[260px] lg:translate-x-0" : ""}`}
        style={{
          height: "calc(100vh - 2rem)",
          background: "var(--glass)",
          backdropFilter: "blur(20px)",
          border: "1px solid var(--line)",
          boxShadow: "0 8px 30px rgba(28,28,26,0.06)",
        }}
      >
        <div className={`pt-5 pb-3 ${isCollapsed ? "px-2.5" : "px-4"}`}>
          <button
            onClick={handleRescan}
            disabled={isRescanning}
            title={isCollapsed ? (isRescanning ? "Scanning…" : "Rescan") : undefined}
            className={`flex items-center justify-center gap-2 rounded-full text-[13px] font-medium transition-all disabled:opacity-60 bg-white border border-line hover:bg-black/[0.03] text-[#1C1C1A] ${
              isCollapsed ? "w-[44px] h-[44px] mx-auto p-0" : "w-full px-3 py-2.5"
            }`}
          >
            <IconRescan spinning={isRescanning} />
            {!isCollapsed && (isRescanning ? "Scanning…" : "Rescan")}
          </button>
        </div>

        <nav className={`flex-1 flex flex-col gap-0.5 overflow-y-auto pt-1 ${isCollapsed ? "px-2" : "px-3"}`}>
          {navItems.map((item) => {
            const isActive = item.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                title={isCollapsed ? item.label : undefined}
                className={`flex items-center rounded-xl text-[13px] transition-all ${
                  isCollapsed ? "justify-center w-[44px] h-[40px] mx-auto" : "gap-2.5 px-3 py-2"
                } ${isActive ? "font-medium shadow-sm" : "text-[#1C1C1A]/70 hover:bg-black/[0.04]"}`}
                style={
                  isActive
                    ? { background: "linear-gradient(135deg, #EFD9FF 0%, #DCC2FB 100%)", color: "#3B1D6E" }
                    : undefined
                }
              >
                <span className={`flex-shrink-0 ${isActive ? "text-[#7C3AED]" : "text-[#1C1C1A]/50"}`}>{item.icon}</span>
                {!isCollapsed && item.label}
              </Link>
            );
          })}
        </nav>

        <div className={`pb-4 pt-3 border-t border-line flex flex-col gap-0.5 ${isCollapsed ? "px-2" : "px-3"}`}>
          {/* Collapse/Expand toggle — desktop only */}
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12.5px] text-[#1C1C1A]/50 hover:bg-black/[0.04] w-full justify-center"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <IconExpand /> : <IconCollapse />}
            {!isCollapsed && <span className="flex-1 text-left">Collapse</span>}
          </button>

          {isCollapsed ? (
            <>
              <Link
                href="/dashboard/settings"
                title={workspaceName}
                className="flex items-center justify-center py-2 rounded-lg text-[#1C1C1A]/70 hover:bg-black/[0.04]"
              >
                <span className="w-7 h-7 rounded-full bg-lilac flex items-center justify-center text-[11px] font-medium text-[#3B1D6E] flex-shrink-0">
                  {email.charAt(0).toUpperCase()}
                </span>
              </Link>
              {!isPaid && (
                <Link
                  href="/upgrade"
                  title="Upgrade"
                  className="flex items-center justify-center py-2 rounded-lg text-[12.5px] font-medium"
                  style={{ background: "#EFD9FF", color: "#1C1C1A" }}
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M7 1L9 5.5L14 6.5L10.5 10L11.5 14L7 11.5L2.5 14L3.5 10L0 6.5L5 5.5L7 1Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
                  </svg>
                </Link>
              )}
            </>
          ) : (
            <>
              <button className="flex items-center gap-2.5 px-2 py-2 rounded-lg text-[12.5px] text-[#1C1C1A]/70 hover:bg-black/[0.04] w-full text-left">
                <span className="w-7 h-7 rounded-full bg-lilac flex items-center justify-center text-[11px] font-medium text-[#3B1D6E] flex-shrink-0">
                  {email.charAt(0).toUpperCase()}
                </span>
                <span className="truncate flex-1">{workspaceName}</span>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="flex-shrink-0 opacity-50">
                  <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              {!isPaid && (
                <Link href="/upgrade" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12.5px] font-medium" style={{ background: "#EFD9FF", color: "#1C1C1A" }}>
                  Upgrade
                </Link>
              )}
              <form action="/api/logout" method="POST">
                <button type="submit" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12.5px] text-[#1C1C1A]/50 hover:bg-black/[0.04] w-full text-left">
                  Log out
                </button>
              </form>
            </>
          )}
        </div>
      </aside>
    </>
  );
}
