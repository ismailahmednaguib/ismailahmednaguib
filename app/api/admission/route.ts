// app/api/admission/route.ts : استقبال طلبات التقديم فقط — بتنظيف المدخلات
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { z } from "zod";
import { db } from "../../../lib/db";
import { cleanText } from "../../../lib/security";

const Schema = z.object({
  name: z.string().min(3).max(80),
  phone: z.string().min(6).max(20),
  track: z.enum(["academy", "institute", "quran", "college"]),
  course: z.string().min(2).max(120),
});

export async function POST(req: Request) {
  const form = await req.formData().catch(() => null);
  const raw: Record<string, unknown> = form
    ? Object.fromEntries((form as FormData).entries())
    : await req.json().catch(() => ({}));
  const parsed = Schema.safeParse({
    name: cleanText(String(raw["name"] || ""), 80),
    phone: cleanText(String(raw["phone"] || ""), 20),
    track: cleanText(String(raw["track"] || "academy"), 20),
    course: cleanText(String(raw["course"] || ""), 120),
  });
  if (!parsed.success) return NextResponse.json({ error: "بيانات ناقصة" }, { status: 400 });
  const all = await db.admissions();
  all.push({ id: randomUUID().slice(0, 8), ...parsed.data, date: new Date().toISOString().slice(0, 10), status: "new" });
  await db.write("admissions.json", all);
  if (form) return NextResponse.redirect(new URL("/admission?ok=1", req.url));
  return NextResponse.json({ ok: true });
}

