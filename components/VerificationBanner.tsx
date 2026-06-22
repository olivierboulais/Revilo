"use client";

import { useState } from "react";

export function VerificationBanner({ email }: { email: string }) {
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  async function resend() {
    setSending(true);
    try {
      await fetch("/api/auth/resend-verification", { method: "POST" });
      setSent(true);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="rounded-xl bg-[#FFFBEB] border border-[#FDE68A] px-4 py-3 flex items-center justify-between gap-4 text-[13px]">
      <span className="text-[#92400E]">
        {sent
          ? `Verification email sent to ${email}. Check your inbox.`
          : `Please verify your email address (${email}) to unlock all features.`}
      </span>
      <div className="flex items-center gap-3 flex-shrink-0">
        {!sent && (
          <button
            onClick={resend}
            disabled={sending}
            className="font-medium text-[#92400E] hover:underline disabled:opacity-50"
          >
            {sending ? "Sending…" : "Resend email"}
          </button>
        )}
        <button onClick={() => setDismissed(true)} className="text-[#B45309] hover:opacity-70" aria-label="Dismiss">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}
