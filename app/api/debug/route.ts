import { NextResponse } from "next/server";

export async function GET() {
  const url = process.env.DATABASE_URL ?? "not set";
  const masked = url.replace(/:([^:@]{1,}?)@/, ":***@");

  try {
    const { getDb } = await import("@/lib/db/client");
    const db = await getDb();
    const result = await db.query<{ now: string }>("SELECT NOW() as now");
    return NextResponse.json({ url: masked, connected: true, time: result.rows[0]?.now });
  } catch (err) {
    return NextResponse.json({ url: masked, connected: false, error: String(err) });
  }
}
