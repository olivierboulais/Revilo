import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { findUserByEmail } from "@/lib/db/users";
import { updateFigmaFileKey } from "@/lib/db/sources";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const fileKey = typeof body.fileKey === "string" ? body.fileKey.trim() : "";
  if (!fileKey) return NextResponse.json({ error: "fileKey is required" }, { status: 400 });

  // Accept full Figma URLs: https://www.figma.com/file/:key/... or just the key
  const match = fileKey.match(/figma\.com\/(?:file|design)\/([A-Za-z0-9]+)/);
  const key = match ? match[1] : fileKey;

  const user = await findUserByEmail(session.email);
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  await updateFigmaFileKey(user.id, key);
  return NextResponse.json({ ok: true, fileKey: key });
}
