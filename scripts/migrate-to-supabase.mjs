// scripts/migrate-to-supabase.mjs : يرفع كل ملفات data/*.json إلى Supabase جدول ian_store مرة واحدة
// التشغيل: SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/migrate-to-supabase.mjs
import { readFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const __dir = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dir, "..");
const FILES = ["courses.json", "books.json", "lessons.json", "scholars.json", "news.json", "fatwas.json", "certificates.json", "admissions.json", "settings.json"];

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("ضع SUPABASE_URL و SUPABASE_SERVICE_ROLE_KEY في البيئة أولا");
  process.exit(1);
}
const sb = createClient(url, key, { auth: { persistSession: false } });

let ok = 0;
for (const f of FILES) {
  try {
    const raw = await readFile(path.join(ROOT, "data", f), "utf8");
    const value = JSON.parse(raw);
    const k = f.replace(/\.json$/, "");
    const { error } = await sb.from("ian_store").upsert({ key: k, value, updated_at: new Date().toISOString() }, { onConflict: "key" });
    if (error) console.error("FAIL", f, error.message);
    else { console.log("OK", f, Array.isArray(value) ? `(${value.length})` : ""); ok++; }
  } catch (e) {
    console.error("SKIP", f, e.message);
  }
}
console.log(`تم: ${ok}/${FILES.length} — ملاحظة: users.json لا يرفع (ينشأ عند أول دخول للأدمن)`);
