// app/api/student/enroll/route.ts : تسجيل الطالب في دورة + بريد ترحيب
import { NextResponse } from "next/server";
import { currentUser } from "../../../../lib/auth";
import { enrollStudent } from "../../../../lib/enrollment";
import { db } from "../../../../lib/db";
import { sendEmail, welcomeEmail } from "../../../../lib/email";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const u = await currentUser();
  if (!u) return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  if (u.role === "admin") return NextResponse.json({ error: "للطلاب فقط" }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const courseSlug = String(body.courseSlug || "");
  
  if (!courseSlug) {
    return NextResponse.json({ error: "slug الدورة مطلوب" }, { status: 400 });
  }

  const courses = await db.courses();
  const course = courses.find(c => c.slug === courseSlug);
  if (!course) return NextResponse.json({ error: "الدورة غير موجودة" }, { status: 404 });

  const enrollment = await enrollStudent(u.email, courseSlug);
  if (!enrollment) return NextResponse.json({ error: "خطأ في التسجيل" }, { status: 500 });

  // إرسال بريد ترحيب (غير معطل للعملية)
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const email = welcomeEmail(u.email.split("@")[0], course.title, `${siteUrl}/student`);
  sendEmail({ to: u.email, ...email }).catch(console.error);
  
  return NextResponse.json({ ok: true, enrollment });
}