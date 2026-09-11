// lib/db.ts : طبقة هجينة — الجداول العدلة أولا ثم ian_store ثم ملفات محلية
import { promises as fs } from "fs";
import os from "os";
import path from "path";
import { getSupabase, fileKey, STORE_TABLE } from "./supabase";
import { readMapped, toRows, TABLE_OF, deleteTableRow } from "./db-tables";
import { readSettingsRow, writeSettingsRow } from "./db-settings";
import type { Course, Book, Lesson, Scholar, NewsItem, Fatwa, Certificate, Admission } from "./types";

const DATA = path.join(process.cwd(), "data");
const TMP = path.join(os.tmpdir(), "ian-data");

export interface UserRow { email: string; hash: string; role: string; }
function useSupabase(): boolean {
  return !!process.env.SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY;
}
async function readLocal<T>(file: string, fallback: T): Promise<T> {
  try { return JSON.parse(await fs.readFile(path.join(TMP, file), "utf8")); }
  catch { /* skip */ }
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
  } catch { /* read-only host */ }
}
async function read<T>(file: string, fallback: T): Promise<T> {
  const sb = getSupabase();
  if (sb) {
    try {
      if (file === "settings.json") {
        const row = await readSettingsRow();
        if (row) return row as unknown as T;
      }
      const mapped = await readMapped<T>(file);
      if (mapped) return mapped;
      if (file === "users.json") {
        const { data } = await sb.from("ian_users").select("email,hash,role");
        if (data && data.length) return data as unknown as T;
      }
      try {
        const { data, error } = await sb.from(STORE_TABLE).select("value").eq("key", fileKey(file)).maybeSingle();
        if (!error && data && (data as { value: T }).value !== undefined) return (data as { value: T }).value;
      } catch { /* ignore */ }
    } catch { /* fallthrough */ }
    try { return JSON.parse(await fs.readFile(path.join(DATA, file), "utf8")); }
    catch { return fallback; }
  }
  return readLocal(file, fallback);
}
async function write(file: string, value: unknown) {
  const sb = getSupabase();
  if (sb) {
    try {
      if (file === "settings.json") {
        const ok = await writeSettingsRow((value || {}) as Record<string, unknown>);
        if (ok) return;
      }
      const arr = value as Record<string, unknown>[];
      if (file === "users.json" && Array.isArray(arr)) {
        if (!arr.length) return;
        const rows = (arr as unknown as UserRow[]).map((u) => ({ email: u.email, hash: u.hash, role: u.role }));
        const { error } = await sb.from("ian_users").upsert(rows as never[], { onConflict: "email" });
        if (!error) return;
      } else {
        const t = TABLE_OF[file];
        if (t && Array.isArray(arr) && arr.length) {
          const { error } = await sb.from(t.table).upsert(toRows(file, arr) as never[], { onConflict: t.pk });
          if (!error) return;
        } else if (t && Array.isArray(arr) && !arr.length) {
          return; // حماية من المسح الكلي بالخطأ
        }
      }
      try {
        await sb.from(STORE_TABLE).upsert(
          { key: fileKey(file), value: value as never, updated_at: new Date().toISOString() },
          { onConflict: "key" }
        );
      } catch { /* ignore */ }
      return;
    } catch { /* fallthrough */ }
  }
  await writeLocal(file, value);
}
async function deleteFrom(file: string, id: string): Promise<boolean> {
  const sb = getSupabase();
  if (sb) {
    const t = TABLE_OF[file];
    if (t && (await deleteTableRow(t.table, t.pk, id))) return true;
  }
  return false;
}
export const db = {
  read, write, deleteFrom,
  courses: () => read<Course[]>("courses.json", []),
  books: () => read<Book[]>("books.json", []),
  lessons: () => read<Lesson[]>("lessons.json", []),
  scholars: () => read<Scholar[]>("scholars.json", []),
  news: () => read<NewsItem[]>("news.json", []),
  fatwas: () => read<Fatwa[]>("fatwas.json", []),
  certs: () => read<Certificate[]>("certificates.json", []),
  admissions: () => read<Admission[]>("admissions.json", []),
  users: () => read<UserRow[]>("users.json", []),
  settings: () => read<Record<string, unknown>>("settings.json", {}),
  storageMode: () => (useSupabase() ? "supabase" : "local"),
};



