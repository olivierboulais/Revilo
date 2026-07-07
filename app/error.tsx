"use client";

import { useEffect } from "react";
import { Logo } from "@/components/Logo";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 bg-[#F8F7F4]">
      <div className="mb-12">
        <Logo />
      </div>
      <div className="text-center max-w-[380px]">
        <h1 className="text-[22px] font-semibold tracking-tight mb-2">Something went wrong</h1>
        <p className="text-[14px] text-gray mb-8">
          An unexpected error occurred. If it keeps happening, please contact support.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 bg-[#1C1C1A] text-white text-[14px] font-medium px-5 py-2.5 rounded-full hover:opacity-80 transition-opacity"
          >
            Try again
          </button>
          <a
            href="/dashboard"
            className="inline-flex items-center gap-2 text-[14px] font-medium px-5 py-2.5 rounded-full border border-line hover:bg-foreground/[0.05] transition-colors"
          >
            Dashboard
          </a>
        </div>
        {error.digest && (
          <p className="text-[11px] text-gray mt-6 font-mono">Error ID: {error.digest}</p>
        )}
      </div>
    </main>
  );
}
