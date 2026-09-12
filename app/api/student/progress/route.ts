// app/api/student/progress/route.ts : تحديث تقدم الطالب في الدروس
import { NextResponse } from "next/server";
import { currentUser } from "../../../../lib/auth";
import { markLessonComplete } from "../../../../lib/enrollment";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const u = await currentUser();
  if (!u) return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  if (u.role === "admin") return NextResponse.json({ error: "للطلاب فقط" }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const enrollmentId = String(body.enrollmentId || "");
  const lessonId = String(body.lessonId || "");
  
  if (!enrollmentId || !lessonId) {
    return NextResponse.json({ error: "بيانات ناقصة" }, { status: 400 });
  }

  const ok = await markLessonComplete(enrollmentId, lessonId);
  if (!ok) return NextResponse.json({ error: "التسجيل غير موجود" }, { status: 404 });
  
  return NextResponse.json({ ok: true });
}