import { NextResponse } from "next/server";

export async function GET() {
  const supabaseUrl = process.env.SUPABASE_URL ?? "not set";
  const hasKey = !!(process.env.SUPABASE_SECRET_KEY);

  try {
    const { getSupabaseClient } = await import("@/lib/db/supabase");
    const client = getSupabaseClient();
    const { data, error } = await client.from("users").select("id").limit(1);
    if (error) return NextResponse.json({ supabaseUrl, hasKey, connected: false, error: error.message });
    return NextResponse.json({ supabaseUrl, hasKey, connected: true, rowCount: data?.length });
  } catch (err) {
    return NextResponse.json({ supabaseUrl, hasKey, connected: false, error: String(err) });
  }
}
