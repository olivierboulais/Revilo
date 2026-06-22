import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { Logo } from "@/components/Logo";
import { LoginForm } from "./LoginForm";

export default async function LoginPage() {
  const session = await getSession();
  if (session) redirect("/dashboard");

  return (
    <main className="flex-1 flex flex-col items-center justify-center px-6 py-16">
      <div className="mb-10">
        <Logo />
      </div>
      <div className="w-full max-w-[380px]">
        <h1 className="text-[28px] font-semibold tracking-tight leading-tight mb-2">Log in</h1>
        <p className="text-[14px] text-gray mb-8 leading-relaxed">Welcome back. Pick up where you left off.</p>
        <LoginForm />
        <p className="text-[12px] text-gray mt-6 text-center">
          New here?{" "}
          <a href="/signup" className="text-lilac-deep font-medium">
            Create an account
          </a>
        </p>
      </div>
    </main>
  );
}
