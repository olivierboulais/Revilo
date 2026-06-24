import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { Logo } from "@/components/Logo";
import { AuthVisual } from "@/components/AuthVisual";
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
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-16 bg-white relative">
        <a href="/" className="absolute top-6 left-6 text-[13px] text-gray hover:text-[#1C1C1A] transition-colors flex items-center gap-1">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M8.5 3L4.5 7l4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Back
        </a>
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

      <div className="hidden lg:flex flex-1 items-center justify-center bg-lilac relative overflow-hidden">
        <AuthVisual />
      </div>
    </main>
  );
}
