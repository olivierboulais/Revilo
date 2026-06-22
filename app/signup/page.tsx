import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { Logo } from "@/components/Logo";
import { SignupForm } from "./SignupForm";

export default async function SignupPage() {
  const session = await getSession();
  if (session) redirect("/connect");

  return (
    <main className="flex-1 flex flex-col items-center justify-center px-6 py-16">
      <div className="mb-10">
        <Logo />
      </div>
      <div className="w-full max-w-[380px]">
        <h1 className="text-[28px] font-semibold tracking-tight leading-tight mb-2">Create your account</h1>
        <p className="text-[14px] text-gray mb-8 leading-relaxed">
          Connect Figma and GitHub to see where your design system is out of sync.
        </p>
        <SignupForm />
        <p className="text-[12px] text-gray mt-6 text-center">
          Already have an account?{" "}
          <a href="/login" className="text-lilac-deep font-medium">
            Log in
          </a>
        </p>
      </div>
    </main>
  );
}
