"use server";

import { findUserByEmail, createUser } from "@/lib/db/users";
import { createSessionForUser } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";

export interface SignupResult {
  error?: string;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function signupAction(formData: FormData): Promise<SignupResult> {
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

  redirect("/connect");
}
