// app/api/teacher/courses/[slug]/students/route.ts : طلاب كورس المعلم
import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { currentUser } from "@/lib/auth";

async function getUserId(email: string): Promise<string | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data } = await sb.from("ian_users").select("id").eq("email", email).single();
  return data?.id || null;
}

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const user = await currentUser();
  if (!user || user.role === "admin") return NextResponse.json({ ok: false, error: "غير مصرح" }, { status: 403 });

  const { slug } = await params;
  const sb = getSupabase();
  if (!sb) return NextResponse.json({ ok: false, error: "DB غير متاح" }, { status: 503 });

  const userId = await getUserId(user.email);
  if (!userId) return NextResponse.json({ ok: false, error: "مستخدم غير موجود" }, { status: 404 });

  // جلب التسجيلات في الكورس
  const { data: enrollments, error } = await sb
    .from("ian_enrollments")
    .select("*")
    .eq("course_slug", slug)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

  // جلب تفاصيل كل طالب
  const students = await Promise.all((enrollments || []).map(async (enrollment) => {
    // جلب تقدم الطالب
    const { data: progress } = await sb
      .from("ian_progress")
      .select("*")
      .eq("user_id", enrollment.user_id)
      .eq("course_slug", slug)
      .single();

    // عدد الدروس المكتملة
    const { count: completedLessons } = await sb
      .from("ian_progress")
      .select("id", { count: "exact", head: true })
      .eq("user_id", enrollment.user_id)
      .eq("course_slug", slug)
      .eq("completed", true);

    // إجمالي دروس الكورس
    const { count: totalLessons } = await sb
      .from("ian_lessons")
      .select("id", { count: "exact", head: true })
      .eq("course_slug", slug);

    const progressPercent = totalLessons && totalLessons > 0
      ? Math.round((completedLessons || 0) / totalLessons * 100)
      : 0;

    return {
      id: enrollment.user_id,
      email: enrollment.user_email,
      name: enrollment.user_name || enrollment.user_email,
      enrolledAt: enrollment.created_at,
      progress: progressPercent,
      completedLessons: completedLessons || 0,
      totalLessons: totalLessons || 0,
    };
  }));

  return NextResponse.json({ ok: true, students });
}