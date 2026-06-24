import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { Logo } from "@/components/Logo";
import { AuthVisual } from "@/components/AuthVisual";
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

      <div className="hidden lg:flex flex-1 items-center justify-center bg-lilac relative overflow-hidden">
        <AuthVisual />
      </div>
    </main>
  );
}
