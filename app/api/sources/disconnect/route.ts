import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { findUserByEmail } from "@/lib/db/users";
import { disconnectSource } from "@/lib/db/sources";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const provider = body.provider;
  if (provider !== "figma" && provider !== "github") {
    return NextResponse.json({ error: "provider must be figma or github" }, { status: 400 });
  }

  const user = await findUserByEmail(session.email);
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  await disconnectSource(user.id, provider);
  return NextResponse.json({ ok: true });
}
