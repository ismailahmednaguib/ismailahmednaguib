// scripts/migrate-to-supabase.mjs : يرفع data/*.json إلى Supabase مرة واحدة
// 1) الجداول العدلة ian_* (تتحكم فيها من Table Editor)
// 2) جدول ian_store (توافق خلفي)
// التشغيل: SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/migrate-to-supabase.mjs
import { readFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const __dir = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dir, "..");

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("ضع SUPABASE_URL و SUPABASE_SERVICE_ROLE_KEY في البيئة أولا");
  process.exit(1);
}
const sb = createClient(url, key, { auth: { persistSession: false } });

async function load(f) {
  try {
    return JSON.parse(await readFile(path.join(ROOT, "data", f), "utf8"));
  } catch {
    return [];
  }
}

let ok = 0, fail = 0;
async function upsertTable(table, rows, pk) {
  if (!rows.length) { console.log("SKIP (فارغ)", table); return; }
  const { error } = await sb.from(table).upsert(rows, { onConflict: pk });
  if (error) { console.error("FAIL", table, error.message); fail++; }
  else { console.log("OK", table, `(${rows.length})`); ok++; }
}

const courses = await load("courses.json");
await upsertTable("ian_courses", courses.map((c) => ({
  slug: c.slug, title: c.title, track: c.track || "academy", level: c.level || "",
  teacher: c.teacher || "", hours: Number(c.hours || 0), price: Number(c.price || 0),
  description: c.desc || "", video_url: c.videoUrl || "",
})), "slug");

const lessons = await load("lessons.json");
await upsertTable("ian_lessons", lessons.map((l) => ({
  id: l.id, course_slug: l.courseSlug || "", title: l.title,
  video_url: l.videoUrl || "", duration: l.duration || "", is_free: !!l.free,
})), "id");

const books = await load("books.json");
await upsertTable("ian_books", books.map((b) => ({
  slug: b.slug, title: b.title, author: b.author || "", track: b.track || "academy",
  pages: Number(b.pages || 0), pdf_url: b.pdfUrl || "", description: b.desc || "",
})), "slug");

for (const [file, table, pk] of [
  ["scholars.json", "ian_scholars", "slug"],
  ["news.json", "ian_news", "slug"],
  ["fatwas.json", "ian_fatwas", "id"],
  ["certificates.json", "ian_certificates", "code"],
  ["admissions.json", "ian_admissions", "id"],
]) {
  await upsertTable(table, await load(file), pk);
}

// توافق خلفي في ian_store أيضا
for (const f of ["courses.json", "books.json", "lessons.json", "scholars.json", "news.json", "fatwas.json", "certificates.json", "admissions.json", "settings.json"]) {
  const value = await load(f === "settings.json" ? "settings.json" : f);
  const { error } = await sb.from("ian_store").upsert({ key: f.replace(/\.json$/, ""), value, updated_at: new Date().toISOString() }, { onConflict: "key" });
  if (error) { console.error("FAIL store", f, error.message); fail++; }
  else { console.log("OK store", f); ok++; }
}

console.log(`تم: ${ok} ناجح / ${fail} فاشل — ملاحظة: users.json لا يرفع (ينشأ عند أول دخول أو set-admin.sql)`);
if (fail) process.exit(1);

