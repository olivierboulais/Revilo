import { createSession, getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/Button";

async function login(formData: FormData) {
  "use server";
  const email = String(formData.get("email") ?? "").trim();
  if (!email) return;
  // Mock: no password check, no lookup against a real user table yet.
  // Workspace name is re-derived from the email's domain just so the
  // dashboard has something sensible to show without a real backend.
  const domain = email.split("@")[1]?.split(".")[0] ?? "Workspace";
  const workspaceName = `${domain.charAt(0).toUpperCase()}${domain.slice(1)} Design System`;
  await createSession(email, workspaceName);
  redirect("/dashboard");
}

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
        <form action={login} className="flex flex-col gap-3">
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
          <Button type="submit" variant="dark" className="justify-center mt-2 w-full">
            Continue
          </Button>
        </form>
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
