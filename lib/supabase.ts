// lib/supabase.ts : عميل Supabase للسيرفر فقط — ملف مستقل
// يعمل فقط عندما توجد متغيرات بيئة سليمة (على Vercel).
// محليا أو عند غياب/خطأ المتغيرات يرجع null ويعمل التخزين المحلي JSON تلقائيا.
// مهم: لا يرمي استثناء أبدا حتى لا يكسر بناء Vercel أثناء جمع الصفحات.
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

function cleanUrl(v: unknown): string {
  return String(v || "").trim().replace(/\/$/, "");
}

export function isSupabaseConfigured(): boolean {
  const url = cleanUrl(process.env.SUPABASE_URL);
  const key = String(process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
  if (!url || !key || key.length < 20) return false;
  try {
    const u = new URL(url);
    if (u.protocol !== "https:" && u.protocol !== "http:") return false;
    if (!u.hostname.includes(".")) return false;
    return true;
  } catch {
    return false;
  }
}

export function getSupabase(): SupabaseClient | null {
  try {
    if (!isSupabaseConfigured()) return null;
    if (!client) {
      client = createClient(
        cleanUrl(process.env.SUPABASE_URL),
        String(process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim(),
        { auth: { persistSession: false, autoRefreshToken: false } }
      );
    }
    return client;
  } catch {
    return null;
  }
}

// جدول التخزين الموحد: سطر لكل ملف JSON (key = courses, books, users ...)
export const STORE_TABLE = "ian_store";
export function fileKey(file: string): string {
  return file.replace(/\.json$/, "");
}

// باكت ملفات المنصة (كتب PDF وصور)
export const FILES_BUCKET = "ian-files";
