import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { findUserByEmail } from "@/lib/db/users";
import { upsertSource } from "@/lib/db/sources";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { token } = await request.json();
  if (!token || typeof token !== "string" || !token.trim()) {
    return NextResponse.json({ error: "Token required" }, { status: 400 });
  }

  // Verify the token works before saving
  const verify = await fetch("https://api.figma.com/v1/me", {
    headers: { Authorization: `Bearer ${token.trim()}` },
  });
  if (!verify.ok) {
    return NextResponse.json({ error: "Invalid token — check it and try again." }, { status: 400 });
  }
  const me = await verify.json() as { handle?: string; email?: string };

  const user = await findUserByEmail(session.email);
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  await upsertSource(user.id, "figma", token.trim(), null, me.handle ?? me.email ?? null, null);

  return NextResponse.json({ ok: true, handle: me.handle ?? me.email ?? null });
}
