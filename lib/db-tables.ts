// lib/db-tables.ts : التعامل مع الجداول العدلة ian_* — ملف مستقل
import { getSupabase } from "./supabase";
import { rowToCourse, courseToRow, rowToLesson, lessonToRow, rowToBook, bookToRow } from "./db-maps";
import type { Course, Book, Lesson } from "./types";

export const TABLE_OF: Record<string, { table: string; pk: string }> = {
  "courses.json": { table: "ian_courses", pk: "slug" },
  "books.json": { table: "ian_books", pk: "slug" },
  "lessons.json": { table: "ian_lessons", pk: "id" },
  "scholars.json": { table: "ian_scholars", pk: "slug" },
  "news.json": { table: "ian_news", pk: "slug" },
  "fatwas.json": { table: "ian_fatwas", pk: "id" },
  "certificates.json": { table: "ian_certificates", pk: "code" },
  "admissions.json": { table: "ian_admissions", pk: "id" },
};

// قراءة جدول عدل — ترجع null لو الجدول مش موجود أو فاضي
export async function readTableRows<T>(table: string, map: (r: Record<string, unknown>) => T): Promise<T[] | null> {
  const sb = getSupabase();
  if (!sb) return null;
  try {
    const { data, error } = await sb.from(table).select("*").order("created_at", { ascending: true });
    if (error) return null;
    const rows = (data || []) as Record<string, unknown>[];
    if (!rows.length) return null;
    return rows.map(map);
  } catch {
    return null;
  }
}

export async function readRawRows(table: string): Promise<Record<string, unknown>[] | null> {
  const sb = getSupabase();
  if (!sb) return null;
  try {
    const { data, error } = await sb.from(table).select("*").order("created_at", { ascending: true });
    if (error) return null;
    const rows = (data || []) as Record<string, unknown>[];
    if (!rows.length) return null;
    return rows;
  } catch {
    return null;
  }
}

// كتابة مصفوفة كاملة في جدول عدل (upsert) — ترجع true لو نجح
export async function writeTableRows(table: string, rows: Record<string, unknown>[], pk: string): Promise<boolean> {
  const sb = getSupabase();
  if (!sb || !rows.length) return false;
  try {
    const { error } = await sb.from(table).upsert(rows as never[], { onConflict: pk });
    return !error;
  } catch {
    return false;
  }
}

export async function deleteTableRow(table: string, pk: string, id: string): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;
  try {
    const { error } = await sb.from(table).delete().eq(pk, id);
    return !error;
  } catch {
    return false;
  }
}

// تحويلات سريعة حسب اسم الملف
export function toRows(file: string, arr: unknown[]): Record<string, unknown>[] {
  if (file === "courses.json") return (arr as Course[]).map(courseToRow);
  if (file === "lessons.json") return (arr as Lesson[]).map(lessonToRow);
  if (file === "books.json") return (arr as Book[]).map(bookToRow);
  return arr as Record<string, unknown>[];
}

export async function readMapped<T>(file: string): Promise<T | null> {
  if (file === "courses.json") return (await readTableRows("ian_courses", rowToCourse)) as unknown as T | null;
  if (file === "lessons.json") return (await readTableRows("ian_lessons", rowToLesson)) as unknown as T | null;
  if (file === "books.json") return (await readTableRows("ian_books", rowToBook)) as unknown as T | null;
  const t = TABLE_OF[file];
  if (t) return (await readRawRows(t.table)) as unknown as T | null;
  return null;
}
