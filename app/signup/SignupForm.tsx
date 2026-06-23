"use client";

import { useState } from "react";
import { signupAction } from "./actions";
import { Button } from "@/components/Button";
import { isRedirectError } from "next/dist/client/components/redirect-error";

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
      // On success the action redirects server-side, so no further
      // client-side handling is needed.
    } catch (err) {
      if (isRedirectError(err)) throw err;
      setError("Something went wrong. Please try again.");
      setIsSubmitting(false);
    }
  }

  return (
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
      <Button type="submit" variant="dark" className="justify-center mt-2 w-full" disabled={isSubmitting}>
        {isSubmitting ? "Creating account…" : "Continue"}
      </Button>
    </form>
  );
}
