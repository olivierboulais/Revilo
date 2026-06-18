import { ButtonHTMLAttributes, AnchorHTMLAttributes, ReactNode } from "react";
import Link from "next/link";

type Variant = "dark" | "outline" | "lilac";

const variantClasses: Record<Variant, string> = {
  dark: "bg-[#1C1C1A] text-white",
  outline: "bg-transparent text-[#1C1C1A] border border-line",
  lilac: "bg-lilac text-[#1C1C1A]",
};

const base =
  "inline-flex items-center gap-[9px] rounded-full pl-[18px] pr-2 py-[9px] text-[13px] font-medium whitespace-nowrap cursor-pointer transition-transform duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100";

function Arrow() {
  return (
    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white/15">
      <svg width="12" height="12" viewBox="0 0 13 13" fill="none">
        <path d="M1.5 11.5L11.5 1.5M11.5 1.5H3.5M11.5 1.5V9.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

interface CommonProps {
  variant?: Variant;
  withArrow?: boolean;
  children: ReactNode;
  className?: string;
}

export function Button({
  variant = "dark",
  withArrow = true,
  children,
  className = "",
  ...rest
}: CommonProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={`${base} ${variantClasses[variant]} ${className}`} {...rest}>
      {children}
      {withArrow && <Arrow />}
    </button>
  );
}

export function LinkButton({
  variant = "dark",
  withArrow = true,
  children,
  className = "",
  href,
  ...rest
}: CommonProps & AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
  return (
    <Link href={href} className={`${base} ${variantClasses[variant]} ${className}`} {...rest}>
      {children}
      {withArrow && <Arrow />}
    </Link>
  );
}
