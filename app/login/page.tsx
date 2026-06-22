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
    <main className="flex-1 flex flex-col items-center justify-center px-6 py-16">
      <div className="mb-10">
        <Logo />
      </div>
      <div className="w-full max-w-[380px]">
        <h1 className="text-[28px] font-semibold tracking-tight leading-tight mb-2">Log in</h1>
        <p className="text-[14px] text-gray mb-8 leading-relaxed">Welcome back. Pick up where you left off.</p>

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
        <p className="text-[12px] text-gray mt-6 text-center">
          New here?{" "}
          <a href="/signup" className="text-lilac-deep font-medium">
            Create an account
          </a>
        </p>
      </div>
    </main>
  );
}
