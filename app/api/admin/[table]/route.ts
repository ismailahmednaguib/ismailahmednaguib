// app/api/admin/[table]/route.ts : تحكم كامل آمن — إضافة/حذف/تعديل لكل جدول
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { db } from "../../../../lib/db";
import { nextCertCode } from "../../../../lib/cert-number";
import { cleanText, cleanUrl } from "../../../../lib/security";
import { currentUser } from "../../../../lib/auth";

const FILES: Record<string, string> = {
  courses: "courses.json", books: "books.json", lessons: "lessons.json",
  scholars: "scholars.json", news: "news.json", fatwas: "fatwas.json",
  certificates: "certificates.json", admissions: "admissions.json",
};

// حقول رقمية تحول لأرقام قبل الحفظ
const NUMERIC = new Set(["hours", "price", "pages"]);
// حقول روابط تنظف بصرامة ضد javascript: و data:
const URLS = new Set(["videoUrl", "pdfUrl"]);

async function guard() {
  const u = await currentUser();
  if (!u || u.role !== "admin") return null;
  return u;
}

function cleanObj(o: Record<string, unknown>) {
  const out: Record<string, unknown> = {};
  for (const k of Object.keys(o || {})) {
    const v = o[k];
    // تجاهل ملفات الرفع (إن وجدت) — المنصة تستقبل روابط فقط
    if (typeof File !== "undefined" && v instanceof File) continue;
    if (k === "id" || k === "slug" || k === "code") out[k] = cleanText(String(v ?? ""), 120);
    else if (URLS.has(k)) out[k] = cleanUrl(String(v ?? ""), 2000);
    else if (NUMERIC.has(k)) {
      const n = Number(String(v ?? "").trim());
      out[k] = Number.isFinite(n) ? n : 0;
    }
    else if (k === "free") out[k] = v === "1" || v === "on" || v === true || v === "true";
    else if (typeof v === "number") out[k] = v;
    else if (typeof v === "boolean") out[k] = v;
    else out[k] = cleanText(String(v ?? ""), 2000);
  }
  return out;
}

export async function POST(req: Request, { params }: { params: { table: string } }) {
  if (!(await guard())) return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  const file = FILES[params.table];
  if (!file) return NextResponse.json({ error: "جدول غير معروف" }, { status: 400 });
  const form = await req.formData().catch(() => null);
  const raw = form ? Object.fromEntries((form as FormData).entries()) : await req.json().catch(() => ({}));
  const item = cleanObj(raw as Record<string, unknown>);
  if (!item["id"] && !item["slug"] && !item["code"]) item["id"] = randomUUID().slice(0, 8);
  if (params.table === "certificates" && !item["code"]) {
    const existing = await db.certs().catch(() => []);
    item["code"] = nextCertCode(existing.map((c) => ({ code: c.code })));
  }
  if (params.table === "admissions" && !item["date"]) item["date"] = new Date().toISOString().slice(0, 10);
  const all = await db.read<Record<string, unknown>[]>(file, []);
  all.push(item);
  await db.write(file, all);
  if (form) {
    if (params.table === "certificates" && item["code"]) {
      return NextResponse.redirect(new URL(`/dashboard?cert=${encodeURIComponent(String(item["code"]))}#certs`, req.url));
    }
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }
  return NextResponse.json({ ok: true, item });
}

export async function DELETE(req: Request, { params }: { params: { table: string } }) {
  if (!(await guard())) return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  const file = FILES[params.table];
  if (!file) return NextResponse.json({ error: "جدول غير معروف" }, { status: 400 });
  const id = new URL(req.url).searchParams.get("id") || "";
  // حذف مباشر من الجداول العدلة أولا (Supabase) ثم تحديث النسخ الاحتياطية
  if (await db.deleteFrom(file, id)) return NextResponse.json({ ok: true });
  const all = await db.read<Record<string, unknown>[]>(file, []);
  const kept = all.filter((x) => String(x["id"] || x["slug"] || x["code"]) !== id);
  await db.write(file, kept);
  return NextResponse.json({ ok: true });
}

export async function PUT(req: Request, { params }: { params: { table: string } }) {
  if (!(await guard())) return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  const file = FILES[params.table];
  if (!file) return NextResponse.json({ error: "جدول غير معروف" }, { status: 400 });
  const body = await req.json().catch(() => ({}));
  const item = cleanObj(body as Record<string, unknown>);
  const key = String(item["id"] || item["slug"] || item["code"] || "");
  const all = await db.read<Record<string, unknown>[]>(file, []);
  const i = all.findIndex((x) => String(x["id"] || x["slug"] || x["code"]) === key);
  if (i >= 0) all[i] = { ...all[i], ...item };
  await db.write(file, all);
  return NextResponse.json({ ok: true });
}


