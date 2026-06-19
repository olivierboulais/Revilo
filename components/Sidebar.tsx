"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/Logo";

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

export function Sidebar({ workspaceName, isPaid }: { workspaceName: string; isPaid: boolean }) {
  const pathname = usePathname();

  return (
    <aside className="w-[220px] flex-shrink-0 h-screen sticky top-0 border-r border-line bg-white/60 flex flex-col">
      <div className="px-5 pt-6 pb-5">
        <Logo width={66} height={20} />
      </div>

      <nav className="flex-1 px-3 flex flex-col gap-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = item.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] transition-all ${
                isActive ? "font-medium shadow-sm" : "text-[#1C1C1A]/70 hover:bg-black/[0.04]"
              }`}
              style={
                isActive
                  ? { background: "linear-gradient(135deg, #EFD9FF 0%, #DCC2FB 100%)", color: "#3B1D6E" }
                  : undefined
              }
            >
              <span className={isActive ? "text-[#7C3AED]" : "text-[#1C1C1A]/50"}>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 pb-4 pt-3 border-t border-line flex flex-col gap-0.5">
        <button className="flex items-center justify-between px-3 py-2 rounded-lg text-[12.5px] text-[#1C1C1A]/70 hover:bg-black/[0.04] w-full text-left">
          <span className="truncate">{workspaceName}</span>
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
      </div>
    </aside>
  );
}
