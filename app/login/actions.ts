"use server";

import { findUserByEmail } from "@/lib/db/users";
import { createSessionForUser } from "@/lib/auth/session";
import { checkRateLimit } from "@/lib/rate-limit";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import bcrypt from "bcryptjs";

export interface LoginResult {
  error?: string;
}

// Deliberately generic error message for both "no such user" and "wrong
// password" cases — distinguishing them lets an attacker enumerate which
// emails have accounts, which is a real information leak.
const GENERIC_ERROR = "Incorrect email or password.";

export async function loginAction(formData: FormData): Promise<LoginResult> {
  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const rl = checkRateLimit(`login:${ip}`, 10, 15 * 60 * 1000); // 10 attempts per 15 min
  if (!rl.allowed) {
    return { error: "Too many login attempts. Please wait 15 minutes and try again." };
  }

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const user = await findUserByEmail(email);
  if (!user) {
    return { error: GENERIC_ERROR };
  }

  const isValid = await bcrypt.compare(password, user.password_hash);
  if (!isValid) {
    return { error: GENERIC_ERROR };
  }

  await createSessionForUser(user.id);
  redirect("/dashboard");
}
