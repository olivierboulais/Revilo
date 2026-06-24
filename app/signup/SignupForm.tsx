"use client";

import { useState } from "react";
import { signupAction } from "./actions";
import { Button } from "@/components/Button";
import { isRedirectError } from "next/dist/client/components/redirect-error";

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  );
}

export function SignupForm() {
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(formData: FormData) {
    setError(null);
    setIsSubmitting(true);
    try {
      const result = await signupAction(formData);
      if (result?.error) {
        setError(result.error);
        setIsSubmitting(false);
      }
    } catch (err) {
      if (isRedirectError(err)) throw err;
      setError("Something went wrong. Please try again.");
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <a
        href="/api/auth/google/start"
        className="flex items-center justify-center gap-3 w-full rounded-xl border border-line bg-white px-4 py-3 text-[14px] font-medium hover:bg-[#f9f9f8] transition-colors"
      >
        <GoogleIcon />
        Continue with Google
      </a>

      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-line" />
        <span className="text-[12px] text-gray">Or</span>
        <div className="flex-1 h-px bg-line" />
      </div>

      <form action={handleSubmit} className="flex flex-col gap-3">
        <div>
          <label htmlFor="workspaceName" className="block text-[12px] font-medium text-gray mb-1.5">
            Workspace name
          </label>
          <input
            id="workspaceName"
            name="workspaceName"
            type="text"
            required
            placeholder="Acme Design System"
            className="w-full rounded-xl border border-line bg-white px-4 py-3 text-[14px] outline-none focus:border-lilac-mid transition-colors"
          />
        </div>
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
          <label htmlFor="password" className="block text-[12px] font-medium text-gray mb-1.5">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            placeholder="At least 8 characters"
            className="w-full rounded-xl border border-line bg-white px-4 py-3 text-[14px] outline-none focus:border-lilac-mid transition-colors"
          />
        </div>
        {error && <p className="text-[12.5px] text-[#B3401F] -mt-1">{error}</p>}
        <Button type="submit" variant="dark" className="justify-center mt-1 w-full" disabled={isSubmitting} withArrow={false}>
          {isSubmitting ? "Creating account…" : "Continue"}
        </Button>
      </form>
    </div>
  );
}
