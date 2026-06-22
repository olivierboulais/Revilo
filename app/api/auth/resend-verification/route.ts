import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { findUserByEmail } from "@/lib/db/users";
import { createVerificationToken } from "@/lib/db/verification-tokens";
import { sendVerificationEmail } from "@/lib/email";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const user = await findUserByEmail(session.email);
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  if (user.email_verified_at) {
    return NextResponse.json({ ok: true, alreadyVerified: true });
  }

  try {
    const token = await createVerificationToken(user.id, "email_verify");
    const origin = new URL(request.url).origin;
    await sendVerificationEmail(session.email, token, origin);
  } catch (err) {
    console.error("Failed to resend verification email:", err);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
