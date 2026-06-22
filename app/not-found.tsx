import Link from "next/link";
import { Logo } from "@/components/Logo";

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 bg-[#F8F7F4]">
      <div className="mb-12">
        <Logo />
      </div>
      <div className="text-center max-w-[380px]">
        <div className="text-[72px] font-semibold leading-none tracking-tight text-[#E5E7EB] mb-4">404</div>
        <h1 className="text-[22px] font-semibold tracking-tight mb-2">Page not found</h1>
        <p className="text-[14px] text-gray mb-8">
          This page doesn&apos;t exist or was moved. Head back to your dashboard.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 bg-[#1C1C1A] text-white text-[14px] font-medium px-5 py-2.5 rounded-full hover:opacity-80 transition-opacity"
        >
          Go to dashboard
        </Link>
      </div>
    </main>
  );
}
