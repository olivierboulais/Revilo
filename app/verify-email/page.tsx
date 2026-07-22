"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function VerifyEmailPage() {
  const router = useRouter();
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function resend() {
    setSending(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/resend-verification", { method: "POST" });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setError(d.error ?? "Something went wrong.");
      } else {
        setSent(true);
      }
    } catch {
      setError("Could not send. Please try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F4F0] px-4">
      <div className="w-full max-w-[420px] bg-white rounded-2xl border border-[#E5E4E0] p-10 text-center">
        <div className="w-12 h-12 rounded-full bg-[#F0EDFF] flex items-center justify-center mx-auto mb-6">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" stroke="#7C3AED" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        <h1 className="text-[22px] font-semibold tracking-tight mb-2">Check your inbox</h1>
        <p className="text-[14px] text-[#6B6B67] leading-relaxed mb-8">
          We sent a verification link to your email. Click it to activate your account and access your dashboard.
        </p>

        {sent ? (
          <p className="text-[13px] text-[#16a34a] font-medium">Email sent — check your inbox.</p>
        ) : (
          <button
            onClick={resend}
            disabled={sending}
            className="w-full rounded-xl bg-[#1C1C1A] text-white text-[14px] font-medium py-3 hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {sending ? "Sending…" : "Resend verification email"}
          </button>
        )}

        {error && <p className="text-[12.5px] text-[#B3401F] mt-3">{error}</p>}

        <button
          onClick={async () => {
            await fetch("/api/auth/logout", { method: "POST" });
            router.push("/login");
          }}
          className="mt-6 text-[12.5px] text-[#6B6B67] hover:text-[#1C1C1A] transition-colors"
        >
          Sign in with a different account
        </button>
      </div>
    </div>
  );
}
