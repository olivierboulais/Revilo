import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { findUserByEmail } from "@/lib/db/users";
import { updateFigmaFileKey, parseFigmaFiles, serializeFigmaFiles, FigmaFile, FigmaFileRole } from "@/lib/db/sources";

const VALID_ROLES: FigmaFileRole[] = ["seed", "primitive", "semantic", "component", "project"];

function extractFileKey(input: string): string {
  const match = input.match(/figma\.com\/(?:file|design)\/([A-Za-z0-9]+)/);
  return match ? match[1] : input.trim();
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const user = await findUserByEmail(session.email);
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  // Support both legacy single-file format and new multi-file format
  if (body.files && Array.isArray(body.files)) {
    const files: FigmaFile[] = [];
    for (const f of body.files) {
      const key = typeof f.key === "string" ? extractFileKey(f.key) : "";
      const role = VALID_ROLES.includes(f.role) ? f.role : "project";
      const label = typeof f.label === "string" ? f.label.trim() : "";
      if (!key) continue;
      files.push({ key, role, label: label || role });
    }
    if (files.length === 0) return NextResponse.json({ error: "At least one file is required" }, { status: 400 });
    await updateFigmaFileKey(user.id, serializeFigmaFiles(files));
    return NextResponse.json({ ok: true, files });
  }

  // Legacy: single fileKey
  const fileKey = typeof body.fileKey === "string" ? body.fileKey.trim() : "";
  if (!fileKey) return NextResponse.json({ error: "fileKey is required" }, { status: 400 });
  const key = extractFileKey(fileKey);
  const files: FigmaFile[] = [{ key, role: "project", label: "Design System" }];
  await updateFigmaFileKey(user.id, serializeFigmaFiles(files));
  return NextResponse.json({ ok: true, fileKey: key, files });
}
