import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { Logo } from "@/components/Logo";
import { SignupForm } from "./SignupForm";

export default async function SignupPage() {
  const session = await getSession();
  if (session) redirect("/connect");

  return (
    <main className="flex min-h-screen">
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-16 bg-white">
        <div className="w-full max-w-[400px]">
          <div className="mb-10">
            <Logo />
          </div>
          <h1 className="text-[32px] font-semibold tracking-tight leading-tight mb-2">
            Welcome to Revilo
          </h1>
          <p className="text-[15px] text-gray mb-8 leading-relaxed">
            Get started — it's free. No credit card needed.
          </p>
          <SignupForm />
          <p className="text-[13px] text-gray mt-8 text-center">
            Already have an account?{" "}
            <a href="/login" className="text-lilac-deep font-medium hover:underline">
              Log in
            </a>
          </p>
        </div>
      </div>

      <div className="hidden lg:flex flex-1 items-center justify-center bg-[#F8F7F4] relative overflow-hidden">
        <div className="max-w-[380px] text-center px-8">
          <div className="w-20 h-20 rounded-2xl bg-[#1C1C1A] flex items-center justify-center mx-auto mb-6">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path d="M9 12l2 2 4-4" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="12" cy="12" r="10" stroke="#fff" strokeWidth="2"/>
            </svg>
          </div>
          <h2 className="text-[22px] font-semibold tracking-tight mb-3">
            See where your design system is out of sync
          </h2>
          <p className="text-[14px] text-gray leading-relaxed">
            Connect Figma and GitHub. Get your alignment score in minutes, not weeks.
          </p>
          <div className="flex items-center justify-center gap-6 mt-8">
            <div className="text-center">
              <div className="text-[28px] font-semibold">73</div>
              <div className="text-[11px] text-gray uppercase tracking-wide">Avg score</div>
            </div>
            <div className="w-px h-10 bg-line" />
            <div className="text-center">
              <div className="text-[28px] font-semibold">2 min</div>
              <div className="text-[11px] text-gray uppercase tracking-wide">To first scan</div>
            </div>
            <div className="w-px h-10 bg-line" />
            <div className="text-center">
              <div className="text-[28px] font-semibold">Free</div>
              <div className="text-[11px] text-gray uppercase tracking-wide">First report</div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
