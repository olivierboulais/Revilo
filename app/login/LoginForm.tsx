"use client";

import { useState } from "react";
import Link from "next/link";
import { loginAction } from "./actions";
import { Button } from "@/components/Button";

export function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(formData: FormData) {
    setError(null);
    setIsSubmitting(true);
    try {
      const result = await loginAction(formData);
      if (result?.error) {
        setError(result.error);
        setIsSubmitting(false);
      }
    } catch {
      setError("Something went wrong. Please try again.");
      setIsSubmitting(false);
    }
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-3">
      <div>
        <label htmlFor="email" className="block text-[12px] font-medium text-gray mb-1.5">
          Work email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          placeholder="you@company.com"
          className="w-full rounded-xl border border-line bg-white px-4 py-3 text-[14px] outline-none focus:border-lilac-mid transition-colors"
        />
      </div>
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label htmlFor="password" className="block text-[12px] font-medium text-gray">
            Password
          </label>
          <Link href="/forgot-password" className="text-[12px] text-gray hover:underline">
            Forgot password?
          </Link>
        </div>
        <input
          id="password"
          name="password"
          type="password"
          required
          placeholder="Your password"
          className="w-full rounded-xl border border-line bg-white px-4 py-3 text-[14px] outline-none focus:border-lilac-mid transition-colors"
        />
      </div>
      {error && <p className="text-[12.5px] text-[#B3401F] -mt-1">{error}</p>}
      <Button type="submit" variant="dark" className="justify-center mt-2 w-full" disabled={isSubmitting}>
        {isSubmitting ? "Logging in…" : "Continue"}
      </Button>
    </form>
  );
}
