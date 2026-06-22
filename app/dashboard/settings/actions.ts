"use server";

import { getSession } from "@/lib/auth/session";
import { findUserByEmail } from "@/lib/db/users";
import { updateWorkspaceName, updatePasswordHash } from "@/lib/db/users";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

export interface ActionResult {
  error?: string;
  success?: string;
}

export async function changeWorkspaceNameAction(formData: FormData): Promise<ActionResult> {
  const session = await getSession();
  if (!session) return { error: "Not authenticated" };

  const name = String(formData.get("workspaceName") ?? "").trim();
  if (!name) return { error: "Workspace name cannot be empty." };
  if (name.length > 80) return { error: "Workspace name must be 80 characters or less." };

  const user = await findUserByEmail(session.email);
  if (!user) return { error: "User not found." };

  await updateWorkspaceName(user.id, name);
  revalidatePath("/dashboard", "layout");
  return { success: "Workspace name updated." };
}

export async function changePasswordAction(formData: FormData): Promise<ActionResult> {
  const session = await getSession();
  if (!session) return { error: "Not authenticated" };

  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!currentPassword || !newPassword || !confirmPassword) {
    return { error: "All password fields are required." };
  }
  if (newPassword.length < 8) {
    return { error: "New password must be at least 8 characters." };
  }
  if (newPassword !== confirmPassword) {
    return { error: "New passwords don't match." };
  }

  const user = await findUserByEmail(session.email);
  if (!user) return { error: "User not found." };

  const isValid = await bcrypt.compare(currentPassword, user.password_hash);
  if (!isValid) return { error: "Current password is incorrect." };

  const hash = await bcrypt.hash(newPassword, 12);
  await updatePasswordHash(user.id, hash);
  return { success: "Password updated." };
}
