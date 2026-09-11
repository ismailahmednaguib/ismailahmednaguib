// app/api/status/route.ts : فحص حالة التخزين — بدون كشف أي أسرار أو أسماء خدمات
import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "../../../lib/supabase";
import { isR2Configured } from "../../../lib/r2";
import { db } from "../../../lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const cloud = isSupabaseConfigured();
  const files = isR2Configured();
  let table = "unknown";
  if (cloud) {
    try {
      const courses = await db.courses();
      table = `ok (${courses.length} courses)`;
    } catch (e) {
      table = "error: " + String((e as Error).message || e).slice(0, 200);
    }
  } else {
    table = "not-configured";
  }
  return NextResponse.json({
    ok: true,
    dataStorage: cloud ? "cloud" : "local",
    filesStorage: files ? "cloud-files" : cloud ? "cloud" : "none",
    cloudConfigured: cloud,
    filesConfigured: files,
    table,
  });
}
