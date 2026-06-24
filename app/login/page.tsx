import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { Logo } from "@/components/Logo";
import { LoginForm } from "./LoginForm";

interface Props {
  searchParams: Promise<{ reset?: string; error?: string }>;
}

export default async function LoginPage({ searchParams }: Props) {
  const session = await getSession();
  if (session) redirect("/dashboard");

  const { reset, error } = await searchParams;

  return (
    <main className="flex min-h-screen">
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-16 bg-white">
        <div className="w-full max-w-[400px]">
          <div className="mb-10">
            <Logo />
          </div>
          <h1 className="text-[32px] font-semibold tracking-tight leading-tight mb-2">
            Welcome back
          </h1>
          <p className="text-[15px] text-gray mb-8 leading-relaxed">
            Log in to pick up where you left off.
          </p>

          {reset === "1" && (
            <div className="mb-4 rounded-xl bg-[#F0FDF4] border border-[#BBF7D0] text-[13px] text-[#15803D] px-4 py-3">
              Password updated. Log in with your new password.
            </div>
          )}
          {error === "invalid_token" && (
            <div className="mb-4 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-[13px] text-[#B91C1C] px-4 py-3">
              That verification link is invalid. Please request a new one.
            </div>
          )}
          {error === "expired_token" && (
            <div className="mb-4 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-[13px] text-[#B91C1C] px-4 py-3">
              That verification link has expired. Please request a new one.
            </div>
          )}

          <LoginForm />
          <p className="text-[13px] text-gray mt-8 text-center">
            New here?{" "}
            <a href="/signup" className="text-lilac-deep font-medium hover:underline">
              Create an account
            </a>
          </p>
        </div>
      </div>

      <div className="hidden lg:flex flex-1 items-center justify-center bg-[#F8F7F4] relative overflow-hidden">
        <div className="max-w-[380px] text-center px-8">
          <div className="w-20 h-20 rounded-2xl bg-[#1C1C1A] flex items-center justify-center mx-auto mb-6">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path d="M9 12l2 2 4-4" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="12" cy="12" r="10" stroke="#fff" strokeWidth="2"/>
            </svg>
          </div>
          <h2 className="text-[22px] font-semibold tracking-tight mb-3">
            Design system alignment, measured
          </h2>
          <p className="text-[14px] text-gray leading-relaxed">
            Revilo scans your Figma and GitHub to surface drift, mismatches, and adoption gaps.
          </p>
          <div className="flex items-center justify-center gap-6 mt-8">
            <div className="text-center">
              <div className="text-[28px] font-semibold">73</div>
              <div className="text-[11px] text-gray uppercase tracking-wide">Avg score</div>
            </div>
            <div className="w-px h-10 bg-line" />
            <div className="text-center">
              <div className="text-[28px] font-semibold">2 min</div>
              <div className="text-[11px] text-gray uppercase tracking-wide">To first scan</div>
            </div>
            <div className="w-px h-10 bg-line" />
            <div className="text-center">
              <div className="text-[28px] font-semibold">Free</div>
              <div className="text-[11px] text-gray uppercase tracking-wide">First report</div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
