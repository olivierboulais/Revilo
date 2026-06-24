"use server";

import { findUserByEmail, createUser, markEmailVerified } from "@/lib/db/users";
import { createSessionForUser } from "@/lib/auth/session";
import { createVerificationToken } from "@/lib/db/verification-tokens";
import { sendVerificationEmail, isEmailConfigured } from "@/lib/email";
import { checkRateLimit } from "@/lib/rate-limit";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import bcrypt from "bcryptjs";

export interface SignupResult {
  error?: string;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function signupAction(formData: FormData): Promise<SignupResult> {
  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const rl = checkRateLimit(`signup:${ip}`, 5, 60 * 60 * 1000); // 5 per hour
  if (!rl.allowed) {
    return { error: "Too many signup attempts. Please try again later." };
  }

  const email = String(formData.get("email") ?? "").trim();
  const workspaceName = String(formData.get("workspaceName") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !workspaceName || !password) {
    return { error: "All fields are required." };
  }
  if (!isValidEmail(email)) {
    return { error: "Enter a valid email address." };
  }
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  const existing = await findUserByEmail(email);
  if (existing) {
    return { error: "An account with this email already exists." };
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await createUser(email, passwordHash, workspaceName);
  await createSessionForUser(user.id);

  if (isEmailConfigured()) {
    try {
      const headersList = await headers();
      const host = headersList.get("host") ?? "localhost:3000";
      const proto = process.env.NODE_ENV === "production" ? "https" : "http";
      const baseUrl = `${proto}://${host}`;
      const token = await createVerificationToken(user.id, "email_verify");
      await sendVerificationEmail(email, token, baseUrl);
    } catch (err) {
      console.error("Failed to send verification email:", err);
    }
  } else {
    await markEmailVerified(user.id);
  }

  redirect("/connect");
}
