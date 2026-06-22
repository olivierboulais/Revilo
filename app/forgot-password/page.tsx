"use client";

import { useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/Button";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setSubmitted(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 bg-[#F8F7F4]">
      <div className="mb-10">
        <Logo />
      </div>
      <div className="w-full max-w-[380px]">
        {submitted ? (
          <div className="text-center">
            <h1 className="text-[22px] font-semibold tracking-tight mb-2">Check your inbox</h1>
            <p className="text-[14px] text-gray mb-6">
              If an account with that email exists, we sent a password reset link. It expires in 1 hour.
            </p>
            <Link href="/login" className="text-[13px] font-medium hover:underline">
              Back to login
            </Link>
          </div>
        ) : (
          <>
            <h1 className="text-[22px] font-semibold tracking-tight mb-1">Reset your password</h1>
            <p className="text-[14px] text-gray mb-6">
              Enter your email and we&apos;ll send you a reset link.
            </p>

            {error && (
              <div className="mb-4 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-[13px] text-[#B91C1C] px-4 py-3">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <div>
                <label className="text-[12.5px] text-gray block mb-1.5">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                  placeholder="you@example.com"
                  className="w-full text-[14px] rounded-xl border border-line px-4 py-2.5 outline-none focus:border-[#1C1C1A] bg-white"
                />
              </div>
              <Button type="submit" variant="dark" className="justify-center w-full mt-1" disabled={loading}>
                {loading ? "Sending…" : "Send reset link"}
              </Button>
            </form>

            <p className="text-center text-[13px] text-gray mt-5">
              Remember it?{" "}
              <Link href="/login" className="font-medium text-[#1C1C1A] hover:underline">
                Log in
              </Link>
            </p>
          </>
        )}
      </div>
    </main>
  );
}
