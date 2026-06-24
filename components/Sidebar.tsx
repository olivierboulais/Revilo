"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

function ReviloLogo({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 500 500" fill="none">
      <rect width="500" height="500" rx="100" fill="black"/>
      <mask id="rl" style={{ maskType: "luminance" }} maskUnits="userSpaceOnUse" x="188" y="105" width="125" height="290">
        <path fillRule="evenodd" clipRule="evenodd" d="M188 105H312.101V394.306H188V105Z" fill="white"/>
      </mask>
      <g mask="url(#rl)">
        <path fillRule="evenodd" clipRule="evenodd" d="M308.074 225.878V154.565C308.074 121.524 293.3 104.999 263.751 104.999H188V394.31H226.682V295.267V277.459V244.419V233.948V140.054H252.066C263.617 140.054 269.392 147.043 269.392 161.006V219.113V223.461V244.419H252.066H242.95L252.928 290.678L275.436 394.31H312.103L285.107 273.827C300.418 267.117 308.074 251.134 308.074 225.878Z" fill="white"/>
      </g>
    </svg>
  );
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

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Overview", icon: <IconOverview /> },
  { href: "/dashboard/alignment", label: "Alignment", icon: <IconAlignment /> },
  { href: "/dashboard/adoption", label: "Adoption", icon: <IconAdoption /> },
  { href: "/dashboard/architecture", label: "Architecture", icon: <IconArchitecture /> },
  { href: "/dashboard/team-insights", label: "Team Insights", icon: <IconTeam /> },
  { href: "/dashboard/recommendations", label: "Recommendations", icon: <IconRecommendations /> },
  { href: "/dashboard/sources", label: "Sources", icon: <IconSources /> },
];

function ProfileMenu({ email, workspaceName, isCollapsed }: { email: string; workspaceName: string; isCollapsed: boolean }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center rounded-lg hover:bg-black/[0.04] transition-colors ${
          isCollapsed ? "justify-center py-2 w-full" : "gap-2.5 px-2 py-2 w-full text-left"
        }`}
      >
        <span className="w-7 h-7 rounded-full bg-lilac flex items-center justify-center text-[11px] font-medium text-[#3B1D6E] flex-shrink-0">
          {email.charAt(0).toUpperCase()}
        </span>
        {!isCollapsed && (
          <>
            <span className="truncate flex-1 text-[12.5px] font-medium text-[#1C1C1A]">{workspaceName}</span>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className={`flex-shrink-0 opacity-40 transition-transform ${open ? "rotate-180" : ""}`}>
              <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </>
        )}
      </button>

      {open && (
        <div
          className="absolute bottom-full left-0 right-0 mb-1 rounded-xl bg-white border border-line shadow-lg py-1 z-20"
          style={{ minWidth: isCollapsed ? 160 : undefined, left: isCollapsed ? -4 : undefined }}
        >
          <div className="px-3 py-2 border-b border-line">
            <div className="text-[12px] font-medium text-[#1C1C1A] truncate">{workspaceName}</div>
            <div className="text-[11px] text-[#706F6A] truncate">{email}</div>
          </div>
          <Link
            href="/dashboard/settings"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-3 py-2 text-[12px] text-[#1C1C1A]/70 hover:bg-black/[0.04] transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="7" cy="7" r="1.8" stroke="currentColor" strokeWidth="1.3" />
              <path d="M7 1.5v1.3M7 11.2v1.3M12.5 7h-1.3M2.8 7H1.5M11 3l-.9.9M3.9 10.1L3 11M11 11l-.9-.9M3.9 3.9L3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            </svg>
            Settings
          </Link>
          <form action="/api/logout" method="POST">
            <button
              type="submit"
              className="flex items-center gap-2 px-3 py-2 text-[12px] text-[#1C1C1A]/70 hover:bg-black/[0.04] transition-colors w-full text-left"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M5 1.5h-1.5a1.5 1.5 0 0 0-1.5 1.5v7.5a1.5 1.5 0 0 0 1.5 1.5H5M9 10l3-3-3-3M12 7H5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Log out
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export function Sidebar({
  workspaceName,
  isPaid,
  email,
  tier,
  mobileOpen,
  onMobileClose,
  collapsed,
  onToggleCollapse,
}: {
  workspaceName: string;
  isPaid: boolean;
  email: string;
  tier: string;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}) {
  const pathname = usePathname();

  const isCollapsed = Boolean(collapsed) && !mobileOpen;

  const tierLabel = tier === "monitoring" ? "Monitoring" : tier === "pro" ? "Pro" : "Free";

  return (
    <>
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={onMobileClose} />
      )}
      <aside
        className={`flex-shrink-0 flex flex-col rounded-[28px] transition-all duration-200 relative
          fixed top-4 left-4 z-50 lg:sticky lg:top-4 lg:z-auto lg:translate-x-0
          ${mobileOpen ? "translate-x-0 w-[220px]" : isCollapsed ? "w-[68px]" : "w-[220px]"}
          ${!mobileOpen ? "-translate-x-[260px] lg:translate-x-0" : ""}`}
        style={{
          height: "calc(100vh - 2rem)",
          background: "var(--glass)",
          backdropFilter: "blur(20px)",
          border: "1px solid var(--line)",
          boxShadow: "0 8px 30px rgba(28,28,26,0.06)",
          overflow: "visible",
        }}
      >
        {/* Collapse/Expand floating button on right edge */}
        <button
          onClick={onToggleCollapse}
          className="hidden lg:flex items-center justify-center w-[24px] h-[24px] rounded-full border border-line bg-white hover:bg-black/[0.03] transition-colors absolute top-[26px] -right-[12px] z-10 shadow-sm"
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            {isCollapsed ? (
              <path d="M4.5 2.5L8 6l-3.5 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            ) : (
              <path d="M7.5 2.5L4 6l3.5 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            )}
          </svg>
        </button>

        {/* Logo */}
        <div className={`pt-5 pb-2 flex items-center ${isCollapsed ? "justify-center px-2" : "px-4 gap-2.5"}`}>
          <ReviloLogo size={isCollapsed ? 32 : 28} />
          {!isCollapsed && <span className="text-[14px] font-semibold tracking-tight">Revilo</span>}
        </div>

        <nav className={`flex-1 flex flex-col gap-0.5 overflow-y-auto overflow-x-hidden pt-2 ${isCollapsed ? "px-2" : "px-3"}`}>
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

        <div className={`pb-4 pt-3 flex flex-col gap-1.5 ${isCollapsed ? "px-2" : "px-3"}`}>
          {/* Upgrade */}
          {!isPaid && (
            isCollapsed ? (
              <Link
                href="/upgrade"
                title="Upgrade"
                className="flex items-center justify-center w-[44px] h-[44px] mx-auto rounded-full bg-[#1C1C1A] text-white hover:scale-[1.02] transition-transform"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M7 1.5v11M1.5 7h11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </Link>
            ) : (
              <Link href="/upgrade" className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-black/[0.04] transition-colors group">
                <span className="w-8 h-8 rounded-lg bg-[#1C1C1A] flex items-center justify-center flex-shrink-0">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M7 2l1.8 3.6 4 .6-2.9 2.8.7 4L7 11.2 3.4 13l.7-4L1.2 6.2l4-.6L7 2Z" fill="#C084FC" />
                  </svg>
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-[12.5px] font-medium text-[#1C1C1A]">Upgrade to Pro</div>
                  <div className="text-[11px] text-[#706F6A]">Unlock the full report</div>
                </div>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="flex-shrink-0 text-[#1C1C1A]/30 group-hover:text-[#1C1C1A]/60 transition-colors">
                  <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            )
          )}

          {/* Profile with dropdown */}
          <ProfileMenu email={email} workspaceName={workspaceName} isCollapsed={isCollapsed} />

        </div>
      </aside>
    </>
  );
}
