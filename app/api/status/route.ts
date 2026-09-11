// app/api/status/route.ts : فحص حالة التخزين — بدون كشف أي أسرار
import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "../../../lib/supabase";
import { isR2Configured } from "../../../lib/r2";
import { db } from "../../../lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = isSupabaseConfigured();
  const r2 = isR2Configured();
  let supabaseTable = "unknown";
  if (supabase) {
    try {
      const courses = await db.courses();
      supabaseTable = `ok (${courses.length} courses)`;
    } catch (e) {
      supabaseTable = "error: " + String((e as Error).message || e).slice(0, 200);
    }
  } else {
    supabaseTable = "not-configured (يعمل على ملفات محلية)";
  }
  return NextResponse.json({
    ok: true,
    dataStorage: supabase ? "supabase" : "local",
    filesStorage: r2 ? "r2" : supabase ? "supabase" : "none",
    supabaseConfigured: supabase,
    r2Configured: r2,
    supabaseTable,
    hint: !supabase
      ? "أضف SUPABASE_URL و SUPABASE_SERVICE_ROLE_KEY في Vercel ثم Redeploy"
      : !r2
        ? "البيانات تعمل على Supabase ✓ — R2 اختياري للملفات الكبيرة فقط"
        : "الكل مربوط ✓",
  });
}
