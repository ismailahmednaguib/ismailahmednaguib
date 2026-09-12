// app/api/admin/[table]/route.ts : تحكم كامل آمن — إضافة/حذف/تعديل لكل جدول
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { db } from "../../../../lib/db";
import { nextCertCode } from "../../../../lib/cert-number";
import { cleanText, cleanUrl } from "../../../../lib/security";
import { currentUser, clientIp } from "../../../../lib/auth";
import { logAdd, logEdit, logDelete } from "../../../../lib/activity";
import { sendEmail, certificateEmail } from "../../../../lib/email";
import { issueCertificate } from "../../../../lib/enrollment";

const FILES: Record<string, string> = {
  courses: "courses.json", books: "books.json", lessons: "lessons.json",
  scholars: "scholars.json", news: "news.json", fatwas: "fatwas.json",
  certificates: "certificates.json", admissions: "admissions.json",
};

const NUMERIC = new Set(["hours", "price", "pages"]);
const URLS = new Set(["videoUrl", "pdfUrl"]);

function getTitle(item: Record<string, unknown>, table: string): string {
  return String(item.title || item.name || item.q || item.slug || item.code || item.id || "بلا عنوان");
}

async function guard() {
  const u = await currentUser();
  if (!u || u.role !== "admin") return null;
  return u;
}

function cleanObj(o: Record<string, unknown>) {
  const out: Record<string, unknown> = {};
  for (const k of Object.keys(o || {})) {
    const v = o[k];
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
  const u = await guard();
  if (!u) return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
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
  await logAdd(params.table, String(item.id || item.slug || item.code), getTitle(item, params.table), u.email, u.role, clientIp());
  
  // إرسال بريد للشهادة
  if (params.table === "certificates" && item["code"]) {
    const studentName = String(item.student || "");
    const courseTitle = String(item.course || "");
    const certCode = String(item.code);
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const verifyUrl = `${siteUrl}/verify?code=${encodeURIComponent(certCode)}`;
    const email = certificateEmail(studentName, courseTitle, certCode, verifyUrl);
    sendEmail({ to: u.email, ...email }).catch(console.error); // للإدمن، في الإنتاج يرسل للطالب
    // تحديث التسجيل كحاصل على شهادة
    const enrollments = await db.read<import("../../../../lib/enrollment").Enrollment[]>("enrollments.json", []);
    const eIdx = enrollments.findIndex(e => e.studentEmail === u.email && e.courseSlug === courseTitle);
    if (eIdx >= 0) {
      await issueCertificate(enrollments[eIdx].id, certCode);
    }
  }
  
  if (form) {
    if (params.table === "certificates" && item["code"]) {
      return NextResponse.redirect(new URL(`/dashboard?cert=${encodeURIComponent(String(item["code"]))}#certs`, req.url));
    }
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }
  return NextResponse.json({ ok: true, item });
}

export async function DELETE(req: Request, { params }: { params: { table: string } }) {
  const u = await guard();
  if (!u) return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  const file = FILES[params.table];
  if (!file) return NextResponse.json({ error: "جدول غير معروف" }, { status: 400 });
  const id = new URL(req.url).searchParams.get("id") || "";
  const all = await db.read<Record<string, unknown>[]>(file, []);
  const existing = all.find((x) => String(x["id"] || x["slug"] || x["code"]) === id);
  const title = existing ? getTitle(existing, params.table) : id;
  if (await db.deleteFrom(file, id)) {
    await logDelete(params.table, id, title, u.email, u.role, clientIp());
    return NextResponse.json({ ok: true });
  }
  const kept = all.filter((x) => String(x["id"] || x["slug"] || x["code"]) !== id);
  await db.write(file, kept);
  await logDelete(params.table, id, title, u.email, u.role, clientIp());
  return NextResponse.json({ ok: true });
}

export async function PUT(req: Request, { params }: { params: { table: string } }) {
  const u = await guard();
  if (!u) return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  const file = FILES[params.table];
  if (!file) return NextResponse.json({ error: "جدول غير معروف" }, { status: 400 });
  const body = await req.json().catch(() => ({}));
  const item = cleanObj(body as Record<string, unknown>);
  const key = String(item["id"] || item["slug"] || item["code"] || "");
  const all = await db.read<Record<string, unknown>[]>(file, []);
  const i = all.findIndex((x) => String(x["id"] || x["slug"] || x["code"]) === key);
  if (i >= 0) {
    const oldTitle = getTitle(all[i], params.table);
    all[i] = { ...all[i], ...item };
    await db.write(file, all);
    await logEdit(params.table, key, getTitle(item, params.table), u.email, u.role, `تم تعديل: ${oldTitle}`, clientIp());
  }
  return NextResponse.json({ ok: true });
}