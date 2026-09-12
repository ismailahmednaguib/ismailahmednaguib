// app/api/backup/route.ts : نسخ احتياطي شامل — تصدير واستيراد كل البيانات (أدمن فقط)
import { NextResponse } from "next/server";
import { db } from "../../../lib/db";
import { currentUser, clientIp } from "../../../lib/auth";
import { logExport, logImport } from "../../../lib/activity";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const u = await currentUser();
  if (!u || u.role !== "admin") return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  const data = {
    version: 1,
    exportedAt: new Date().toISOString(),
    courses: await db.courses().catch(() => []),
    books: await db.books().catch(() => []),
    lessons: await db.lessons().catch(() => []),
    scholars: await db.scholars().catch(() => []),
    news: await db.news().catch(() => []),
    fatwas: await db.fatwas().catch(() => []),
    certificates: await db.certs().catch(() => []),
    admissions: await db.admissions().catch(() => []),
    settings: await db.settings().catch(() => ({})),
  };
  await logExport(u.email, u.role, clientIp(req));
  return NextResponse.json({ ok: true, backup: data });
}

export async function POST(req: Request) {
  const u = await currentUser();
  if (!u || u.role !== "admin") return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  const body = await req.json().catch(() => ({}));
  const b = (body as Record<string, unknown>)["backup"] as Record<string, unknown> | undefined;
  if (!b || typeof b !== "object") return NextResponse.json({ error: "ملف النسخة غير صالح" }, { status: 400 });
  const restored: string[] = [];
  const pairs: [string, string][] = [
    ["courses", "courses.json"],
    ["books", "books.json"],
    ["lessons", "lessons.json"],
    ["scholars", "scholars.json"],
    ["news", "news.json"],
    ["fatwas", "fatwas.json"],
    ["certificates", "certificates.json"],
    ["admissions", "admissions.json"],
  ];
  for (const [key, file] of pairs) {
    const v = b[key];
    if (Array.isArray(v) && v.length) {
      await db.write(file, v);
      restored.push(key);
    }
  }
  if (b["settings"] && typeof b["settings"] === "object") {
    await db.write("settings.json", b["settings"]);
    restored.push("settings");
  }
  await logImport(u.email, u.role, clientIp(req));
  return NextResponse.json({ ok: true, restored });
}