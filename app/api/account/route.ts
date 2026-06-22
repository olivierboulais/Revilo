import { NextResponse } from "next/server";
import { getSession, clearSession } from "@/lib/auth/session";
import { findUserByEmail, deleteUser } from "@/lib/db/users";
import bcrypt from "bcryptjs";

export async function DELETE(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const password = typeof body.password === "string" ? body.password : "";
  if (!password) return NextResponse.json({ error: "Password is required to delete your account" }, { status: 400 });

  const user = await findUserByEmail(session.email);
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const isValid = await bcrypt.compare(password, user.password_hash);
  if (!isValid) return NextResponse.json({ error: "Incorrect password" }, { status: 403 });

  await deleteUser(user.id);
  await clearSession();

  return NextResponse.json({ ok: true });
}
