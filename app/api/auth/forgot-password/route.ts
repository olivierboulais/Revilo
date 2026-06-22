import { NextResponse } from "next/server";
import { findUserByEmail } from "@/lib/db/users";
import { createVerificationToken } from "@/lib/db/verification-tokens";
import { sendPasswordResetEmail } from "@/lib/email";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  // Always return success to prevent email enumeration
  const user = await findUserByEmail(email);
  if (user) {
    try {
      const token = await createVerificationToken(user.id, "password_reset", 3600); // 1 hour
      const origin = new URL(request.url).origin;
      await sendPasswordResetEmail(email, token, origin);
    } catch (err) {
      console.error("Failed to send password reset email:", err);
    }
  }

  return NextResponse.json({ ok: true });
}
