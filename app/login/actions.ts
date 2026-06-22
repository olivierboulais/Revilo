"use server";

import { findUserByEmail } from "@/lib/db/users";
import { createSessionForUser } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";

export interface LoginResult {
  error?: string;
}

// Deliberately generic error message for both "no such user" and "wrong
// password" cases — distinguishing them lets an attacker enumerate which
// emails have accounts, which is a real information leak.
const GENERIC_ERROR = "Incorrect email or password.";

export async function loginAction(formData: FormData): Promise<LoginResult> {
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
