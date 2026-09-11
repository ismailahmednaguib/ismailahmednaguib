// lib/db.ts : قاعدة بيانات ملفات JSON منفصلة — كل جدول في ملف لوحده داخل data/
// مهم: على Vercel نظام الملفات للقراءة فقط ما عدا المجلد المؤقت، لذلك نستخدم
// طبقة overlay: الكتابة تذهب للمجلد المؤقت أولا ثم نحاول data (محليا)،
// والقراءة من المؤقت أولا ثم data. بهذا يعمل التعديل محليا تماما،
// وعلى Vercel يعمل مؤقتا حتى إعادة النشر/تجميد الخادم (نحتاج Supabase للثبات الدائم).
import { promises as fs } from "fs";
import os from "os";
import path from "path";
import type { Course, Book, Lesson, Scholar, NewsItem, Fatwa, Certificate, Admission } from "./types";

const DATA = path.join(process.cwd(), "data");
const TMP = path.join(os.tmpdir(), "ian-data");

async function read<T>(file: string, fallback: T): Promise<T> {
  // المؤقت أولا (فيه أحدث تعديلات الجلسة)
  try { return JSON.parse(await fs.readFile(path.join(TMP, file), "utf8")); }
  catch { /* لا يوجد overlay — نكمل */ }
  try { return JSON.parse(await fs.readFile(path.join(DATA, file), "utf8")); }
  catch { return fallback; }
}
async function write(file: string, value: unknown) {
  const body = JSON.stringify(value, null, 2);
  // 1) المؤقت دائما (يعمل على Vercel + محلي)
  await fs.mkdir(TMP, { recursive: true });
  await fs.writeFile(path.join(TMP, file), body, "utf8");
  // 2) محاولة data (تنجح محليا، تفشل بصمت على Vercel للقراءة فقط)
  try {
    await fs.mkdir(DATA, { recursive: true });
    await fs.writeFile(path.join(DATA, file), body, "utf8");
  } catch { /* تجاهل على الاستضافة للقراءة فقط */ }
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
};


