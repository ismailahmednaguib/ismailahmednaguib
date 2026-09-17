// app/api/admission/route.ts : استقبال طلبات التقديم — بتنظيف المدخلات + بريد تأكيد
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { z } from "zod";
import { db } from "../../../lib/db";
import { cleanText } from "../../../lib/security";
import { sendEmail, admissionConfirmationEmail } from "../../../lib/email";

const Schema = z.object({
  name: z.string().min(3).max(80),
  phone: z.string().min(6).max(20),
  email: z.string().email().optional().or(z.literal("")),
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
    email: cleanText(String(raw["email"] || ""), 120),
    track: cleanText(String(raw["track"] || "academy"), 20),
    course: cleanText(String(raw["course"] || ""), 120),
  });
  if (!parsed.success) return NextResponse.json({ error: "بيانات ناقصة" }, { status: 400 });
  const all = await db.admissions();
  all.push({ id: randomUUID().slice(0, 8), ...parsed.data, date: new Date().toISOString().slice(0, 10), status: "new" });
  await db.write("admissions.json", all);

  // بريد تأكيد للتقديم (للأدمن)
  const adminEmail = admissionConfirmationEmail(parsed.data.name, parsed.data.track, parsed.data.course);
  if (adminEmail) sendEmail({ to: process.env.ADMIN_EMAIL || process.env.EMAIL_FROM || "", ...adminEmail }).catch(console.error);

  // بريد تأكيد للطالب (إذا أدخل بريده)
  if (parsed.data.email) {
    const studentEmail = {
      subject: `✅ تم استلام طلبك: ${parsed.data.track} - ${parsed.data.course}`,
      html: `
        <div style="font-family:Cairo,Tahoma,sans-serif;direction:rtl;max-width:600px;margin:auto;background:#f7f5ee;padding:20px;border-radius:12px">
          <div style="background:linear-gradient(135deg,#0b3d2e,#147052);color:#fff;padding:20px;border-radius:12px 12px 0 0;text-align:center">
            <h1 style="margin:0">📝 تم استلام طلبك</h1>
          </div>
          <div style="background:#fff;padding:20px;border-radius:0 0 12px 12px;border:1px solid #e6dfc9">
            <p style="font-size:16px;line-height:1.8">مرحباً <strong>${parsed.data.name}</strong>،</p>
            <p style="font-size:16px;line-height:1.8">شكراً لتقديمك على <strong>${parsed.data.course}</strong> في مسار <strong>${parsed.data.track}</strong>.</p>
            <p style="font-size:16px;line-height:1.8">سيتواصل معك المشرف قريباً على الرقم: <strong>${parsed.data.phone}</strong>. يرجى إبقاء هاتفك متاحاً.</p>
          </div>
        </div>
      `,
      text: `مرحباً ${parsed.data.name}، تم استلام طلبك على ${parsed.data.course} (${parsed.data.track}). سيتواصل معك المشرف قريباً.`,
    };
    sendEmail({ to: parsed.data.email, ...studentEmail }).catch(console.error);
  }
  
  if (form) return NextResponse.redirect(new URL("/admission?ok=1", req.url));
  return NextResponse.json({ ok: true });
}