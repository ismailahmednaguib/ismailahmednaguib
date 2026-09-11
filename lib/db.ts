// lib/db.ts : قاعدة بيانات ملفات JSON منفصلة — كل جدول في ملف لوحده داخل data/
import { promises as fs } from "fs";
import path from "path";
import type { Course, Book, Lesson, Scholar, NewsItem, Fatwa, Certificate, Admission } from "./types";

const DATA = path.join(process.cwd(), "data");
const TMP = "/tmp/ian-data";

async function read<T>(file: string, fallback: T): Promise<T> {
  try { return JSON.parse(await fs.readFile(path.join(DATA, file), "utf8")); }
  catch {
    try { return JSON.parse(await fs.readFile(path.join(TMP, file), "utf8")); }
    catch { return fallback; }
  }
}
async function write(file: string, value: unknown) {
  const body = JSON.stringify(value, null, 2);
  try {
    await fs.mkdir(DATA, { recursive: true });
    await fs.writeFile(path.join(DATA, file), body, "utf8");
  } catch {
    await fs.mkdir(TMP, { recursive: true });
    await fs.writeFile(path.join(TMP, file), body, "utf8");
  }
}

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
  settings: () => read<{ announce?: string; whatsapp?: string }>("settings.json", {}),
};

