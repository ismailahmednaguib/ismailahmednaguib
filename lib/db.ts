// lib/db.ts : طبقة التخزين الهجينة — ملف واحد يتحكم في كل الجداول
// محليا (بدون متغيرات Supabase): ملفات JSON في data/ + طبقة مؤقتة.
// على Vercel (مع SUPABASE_URL + SERVICE_ROLE): جدول ian_store — حفظ دائم وآمن.
// ملاحظة الأمان: SERVICE_ROLE لا يظهر أبدا للمتصفح — يستخدم في السيرفر فقط.
import { promises as fs } from "fs";
import os from "os";
import path from "path";
import { getSupabase, fileKey, STORE_TABLE } from "./supabase";
import type { Course, Book, Lesson, Scholar, NewsItem, Fatwa, Certificate, Admission } from "./types";

const DATA = path.join(process.cwd(), "data");
const TMP = path.join(os.tmpdir(), "ian-data");

function useSupabase(): boolean {
  return !!process.env.SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY;
}

async function readLocal<T>(file: string, fallback: T): Promise<T> {
  try { return JSON.parse(await fs.readFile(path.join(TMP, file), "utf8")); }
  catch { /* لا يوجد overlay */ }
  try { return JSON.parse(await fs.readFile(path.join(DATA, file), "utf8")); }
  catch { return fallback; }
}

async function writeLocal(file: string, value: unknown) {
  const body = JSON.stringify(value, null, 2);
  await fs.mkdir(TMP, { recursive: true });
  await fs.writeFile(path.join(TMP, file), body, "utf8");
  try {
    await fs.mkdir(DATA, { recursive: true });
    await fs.writeFile(path.join(DATA, file), body, "utf8");
  } catch { /* تجاهل على الاستضافة للقراءة فقط */ }
}

async function read<T>(file: string, fallback: T): Promise<T> {
  const sb = getSupabase();
  if (sb) {
    try {
      const { data, error } = await sb.from(STORE_TABLE).select("value").eq("key", fileKey(file)).maybeSingle();
      if (!error && data && (data as { value: T }).value !== undefined) return (data as { value: T }).value;
    } catch { /* سقوط صامت للملفات المحلية */ }
    try { return JSON.parse(await fs.readFile(path.join(DATA, file), "utf8")); }
    catch { return fallback; }
  }
  return readLocal(file, fallback);
}

async function write(file: string, value: unknown) {
  const sb = getSupabase();
  if (sb) {
    try {
      const { error } = await sb.from(STORE_TABLE).upsert(
        { key: fileKey(file), value: value as never, updated_at: new Date().toISOString() },
        { onConflict: "key" }
      );
      if (!error) return; // نجح الحفظ السحابي الدائم
    } catch { /* سقوط للملفات المحلية */ }
  }
  await writeLocal(file, value);
}

export interface UserRow { email: string; hash: string; role: string; }

export const db = {
  read, write,
  courses: () => read<Course[]>("courses.json", []),
  books: () => read<Book[]>("books.json", []),
  lessons: () => read<Lesson[]>("lessons.json", []),
  scholars: () => read<Scholar[]>("scholars.json", []),
  news: () => read<NewsItem[]>("news.json", []),
  fatwas: () => read<Fatwa[]>("fatwas.json", []),
  certs: () => read<Certificate[]>("certificates.json", []),
  admissions: () => read<Admission[]>("admissions.json", []),
  users: () => read<UserRow[]>("users.json", []),
  settings: () => read<{ announce?: string; whatsapp?: string }>("settings.json", {}),
  storageMode: () => (useSupabase() ? "supabase" : "local"),
};



