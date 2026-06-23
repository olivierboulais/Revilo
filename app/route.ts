import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";

export async function GET(request: Request) {
  const session = await getSession();
  if (session) {
    return NextResponse.redirect(new URL("/dashboard", request.url), { status: 307 });
  }
  // public/marketing.html is served as a static CDN asset at /marketing.html
  return NextResponse.redirect(new URL("/marketing.html", request.url), { status: 307 });
}
