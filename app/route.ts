import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { readFile } from "fs/promises";
import path from "path";

// The marketing site is served here, completely outside the React render
// tree. It's a fully self-contained, hand-authored HTML document (own
// <head>, <style>, <script>) with no need to participate in Next.js's
// layout/component system — serving it as a raw response avoids fighting
// React's rules around <html>/<head>/<script> injection for content that
// was never meant to be JSX in the first place.
export async function GET(request: Request) {
  const session = await getSession();
  if (session) {
    return NextResponse.redirect(new URL("/dashboard", request.url), { status: 307 });
  }

  const html = await readFile(path.join(process.cwd(), "public", "marketing.html"), "utf-8");
  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
