"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";

function TabIcon({ d }: { d: string | string[] }) {
  const paths = Array.isArray(d) ? d : [d];
  return (
    <svg width="20" height="20" viewBox="0 0 16 16" fill="none">
      {paths.map((p, i) => (
        <path key={i} d={p} stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      ))}
    </svg>
  );
}

const PRIMARY = [
  {
    href: "/dashboard",
    label: "Overview",
    icon: (
      <svg width="20" height="20" viewBox="0 0 16 16" fill="none">
        <rect x="1.5" y="1.5" width="5.5" height="5.5" rx="1.3" stroke="currentColor" strokeWidth="1.4" />
        <rect x="9" y="1.5" width="5.5" height="5.5" rx="1.3" stroke="currentColor" strokeWidth="1.4" />
        <rect x="1.5" y="9" width="5.5" height="5.5" rx="1.3" stroke="currentColor" strokeWidth="1.4" />
        <rect x="9" y="9" width="5.5" height="5.5" rx="1.3" stroke="currentColor" strokeWidth="1.4" />
      </svg>
    ),
    exact: true,
  },
  {
    href: "/dashboard/alignment",
    label: "Alignment",
    icon: <TabIcon d={["M2 5L8 1.5L14 5L8 8.5L2 5Z", "M2 9L8 12.5L14 9"]} />,
    exact: false,
  },
  {
    href: "/dashboard/recommendations",
    label: "Actions",
    icon: <TabIcon d={["M8 1.5C5.5 1.5 3.5 3.5 3.5 6C3.5 7.7 4.3 8.9 5.5 9.8V11.5H10.5V9.8C11.7 8.9 12.5 7.7 12.5 6C12.5 3.5 10.5 1.5 8 1.5Z", "M6 14H10"]} />,
    exact: false,
  },
  {
    href: "/dashboard/sources",
    label: "Sources",
    icon: (
      <svg width="20" height="20" viewBox="0 0 16 16" fill="none">
        <circle cx="4.5" cy="4.5" r="2" stroke="currentColor" strokeWidth="1.4" />
        <circle cx="11.5" cy="11.5" r="2" stroke="currentColor" strokeWidth="1.4" />
        <path d="M6 6L10 10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    ),
    exact: false,
  },
];

const MORE_ITEMS = [
  {
    href: "/dashboard/adoption",
    label: "Adoption",
    icon: (
      <svg width="20" height="20" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.4" />
        <path d="M8 4.5V8L10.5 9.8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: "/dashboard/architecture",
    label: "Architecture",
    icon: <TabIcon d={["M8 1.5L14 5V11L8 14.5L2 11V5L8 1.5Z", "M8 1.5V14.5"]} />,
  },
  {
    href: "/dashboard/team-insights",
    label: "Team",
    icon: (
      <svg width="20" height="20" viewBox="0 0 16 16" fill="none">
        <circle cx="6" cy="5.5" r="2.2" stroke="currentColor" strokeWidth="1.4" />
        <circle cx="11" cy="6.5" r="1.8" stroke="currentColor" strokeWidth="1.4" />
        <path d="M2 13C2 10.5 3.8 9 6 9C8.2 9 10 10.5 10 13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        <path d="M10.5 9.3C12.2 9.6 13.5 10.9 13.5 13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: "/dashboard/settings",
    label: "Settings",
    icon: (
      <svg width="20" height="20" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.4" />
        <path d="M8 1.5V3.2M8 12.8V14.5M14.5 8H12.8M3.2 8H1.5M12.6 3.4L11.4 4.6M4.6 11.4L3.4 12.6M12.6 12.6L11.4 11.4M4.6 4.6L3.4 3.4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: "/dashboard/help",
    label: "Help",
    icon: (
      <svg width="20" height="20" viewBox="0 0 14 14" fill="none">
        <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.3" />
        <path d="M5.5 5.2C5.5 4.4 6.2 3.8 7 3.8s1.5.6 1.5 1.4c0 .7-.4 1.1-1 1.4C7 6.9 6.8 7.2 6.8 7.7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        <circle cx="7" cy="9.5" r=".6" fill="currentColor" />
      </svg>
    ),
  },
];

export function MobileNav() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);

  const moreActive = MORE_ITEMS.some((item) => pathname.startsWith(item.href));

  // close on outside tap
  useEffect(() => {
    if (!moreOpen) return;
    function onTap(e: MouseEvent | TouchEvent) {
      if (sheetRef.current && !sheetRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    }
    document.addEventListener("mousedown", onTap);
    document.addEventListener("touchstart", onTap);
    return () => {
      document.removeEventListener("mousedown", onTap);
      document.removeEventListener("touchstart", onTap);
    };
  }, [moreOpen]);

  // close when navigating
  useEffect(() => { setMoreOpen(false); }, [pathname]);

  return (
    <div ref={sheetRef} className="fixed bottom-0 inset-x-0 z-40 lg:hidden">
      {/* More sheet */}
      <div
        className={`mx-3 mb-[84px] rounded-2xl border border-line shadow-2xl overflow-hidden transition-all duration-200 ${
          moreOpen ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-3 pointer-events-none"
        }`}
        style={{ background: "var(--surface)", backdropFilter: "blur(20px)" }}
      >
        <div className="p-2 grid grid-cols-4 gap-1">
          {MORE_ITEMS.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1.5 py-3 rounded-xl text-[11px] font-medium transition-colors ${
                  active ? "text-lilac-deep bg-lilac-mid/10" : "text-gray hover:text-foreground hover:bg-foreground/[0.05]"
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
          <form action="/api/logout" method="POST" className="flex">
            <button
              type="submit"
              className="flex flex-col items-center gap-1.5 py-3 rounded-xl text-[11px] font-medium text-gray hover:text-foreground hover:bg-foreground/[0.05] transition-colors w-full"
            >
              <svg width="20" height="20" viewBox="0 0 14 14" fill="none">
                <path d="M5 1.5h-1.5a1.5 1.5 0 0 0-1.5 1.5v7.5a1.5 1.5 0 0 0 1.5 1.5H5M9 10l3-3-3-3M12 7H5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Log out
            </button>
          </form>
        </div>
      </div>

      {/* Tab bar */}
      <nav
        className="mx-2 mb-2 rounded-2xl flex items-stretch justify-around px-1 py-1"
        style={{
          background: "var(--glass)",
          backdropFilter: "blur(20px)",
          border: "1px solid var(--line)",
          boxShadow: "0 -4px 24px rgba(28,28,26,0.10)",
        }}
      >
        {PRIMARY.map((item) => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-[5px] flex-1 py-2 px-1 rounded-xl transition-colors ${
                active ? "text-lilac-deep bg-lilac-mid/10" : "text-gray"
              }`}
            >
              {item.icon}
              <span className="text-[10px] font-medium leading-none">{item.label}</span>
            </Link>
          );
        })}

        {/* More */}
        <button
          onClick={() => setMoreOpen((v) => !v)}
          className={`flex flex-col items-center gap-[5px] flex-1 py-2 px-1 rounded-xl transition-colors ${
            moreActive || moreOpen ? "text-lilac-deep bg-lilac-mid/10" : "text-gray"
          }`}
        >
          <svg width="20" height="20" viewBox="0 0 16 16" fill="none">
            <circle cx="3.5" cy="8" r="1.2" fill="currentColor" />
            <circle cx="8" cy="8" r="1.2" fill="currentColor" />
            <circle cx="12.5" cy="8" r="1.2" fill="currentColor" />
          </svg>
          <span className="text-[10px] font-medium leading-none">More</span>
        </button>
      </nav>
    </div>
  );
}
