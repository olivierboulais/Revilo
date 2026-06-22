import { NextResponse } from "next/server";
import { findVerificationToken, deleteVerificationToken } from "@/lib/db/verification-tokens";
import { markEmailVerified } from "@/lib/db/users";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(new URL("/login?error=invalid_token", request.url));
  }

  const record = await findVerificationToken(token, "email_verify");
  if (!record) {
    return NextResponse.redirect(new URL("/login?error=expired_token", request.url));
  }

  await markEmailVerified(record.user_id);
  await deleteVerificationToken(token);

  return NextResponse.redirect(new URL("/dashboard?verified=1", request.url));
}
