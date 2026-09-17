// app/api/teacher/courses/route.ts : كورسات المعلم
import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { currentUser } from "@/lib/auth";

async function getUserId(email: string): Promise<string | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data } = await sb.from("ian_users").select("id").eq("email", email).single();
  return data?.id || null;
}

export async function GET(req: Request) {
  const user = await currentUser();
  if (!user || user.role === "admin") return NextResponse.json({ ok: false, error: "غير مصرح" }, { status: 403 });

  const sb = getSupabase();
  if (!sb) return NextResponse.json({ ok: false, error: "DB غير متاح" }, { status: 503 });

  const userId = await getUserId(user.email);
  if (!userId) return NextResponse.json({ ok: false, error: "مستخدم غير موجود" }, { status: 404 });

  // جلب الكورسات التي يدرسها المعلم (بافتراض وجود حقل teacher في الكورسات)
  // للآن سنجلب كل الكورسات ونفترض أن المعلم يدير كورسات معينة
  // يمكن إضافة حقل teacher_id في جدول ian_courses لاحقاً
  
  const { data: courses, error } = await sb
    .from("ian_courses")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

  // إحصائيات لكل كورس
  const coursesWithStats = await Promise.all((courses || []).map(async (course) => {
    // عدد الطلاب المسجلين
    const { count: studentsCount } = await sb
      .from("ian_enrollments")
      .select("id", { count: "exact", head: true })
      .eq("course_slug", course.slug);

    // متوسط التقييم
    const { data: reviews } = await sb
      .from("ian_reviews")
      .select("rating")
      .eq("course_slug", course.slug);

    const avgRating = reviews && reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

    return {
      ...course,
      studentsCount: studentsCount || 0,
      avgRating: Math.round(avgRating * 10) / 10,
      totalReviews: reviews?.length || 0,
    };
  }));

  return NextResponse.json({ ok: true, courses: coursesWithStats });
}