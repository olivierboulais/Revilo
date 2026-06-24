import { NextResponse } from "next/server";
import { findVerificationToken, deleteVerificationToken } from "@/lib/db/verification-tokens";
import { findUserById, updatePasswordHash } from "@/lib/db/users";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const token = typeof body.token === "string" ? body.token.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!token || !password) {
    return NextResponse.json({ error: "Token and password are required" }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
  }

  const record = await findVerificationToken(token, "password_reset");
  if (!record) {
    return NextResponse.json({ error: "Invalid or expired reset link" }, { status: 400 });
  }

  const user = await findUserById(record.user_id);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await updatePasswordHash(user.id, passwordHash);
  await deleteVerificationToken(token);

  return NextResponse.json({ ok: true });
}
