// lib/supabase.ts : عميل Supabase للسيرفر فقط — ملف مستقل
// يعمل فقط عندما توجد متغيرات البيئة (على Vercel).
// محليا بدون المتغيرات يرجع null ويعمل التخزين المحلي JSON تلقائيا.
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

export function isSupabaseConfigured(): boolean {
  return !!process.env.SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY;
}

export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  if (!client) {
    client = createClient(
      process.env.SUPABASE_URL as string,
      process.env.SUPABASE_SERVICE_ROLE_KEY as string,
      { auth: { persistSession: false, autoRefreshToken: false } }
    );
  }
  return client;
}

// جدول التخزين الموحد: سطر لكل ملف JSON (key = courses, books, users ...)
export const STORE_TABLE = "ian_store";
export function fileKey(file: string): string {
  return file.replace(/\.json$/, "");
}

// باكت ملفات المنصة (كتب PDF وصور)
export const FILES_BUCKET = "ian-files";
