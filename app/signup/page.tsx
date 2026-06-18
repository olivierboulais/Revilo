import { createSession, getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/Button";

async function signup(formData: FormData) {
  "use server";
  const email = String(formData.get("email") ?? "").trim();
  const workspaceName = String(formData.get("workspaceName") ?? "").trim();
  if (!email || !workspaceName) return;
  await createSession(email, workspaceName);
  redirect("/connect");
}

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
        <form action={signup} className="flex flex-col gap-3">
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
          <Button type="submit" variant="dark" className="justify-center mt-2 w-full">
            Continue
          </Button>
        </form>
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
