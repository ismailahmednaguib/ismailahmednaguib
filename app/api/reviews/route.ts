// app/api/reviews/route.ts : تقييمات الكورسات
import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { currentUser } from "@/lib/auth";

async function getUserId(email: string): Promise<string | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data } = await sb.from("ian_users").select("id").eq("email", email).single();
  return data?.id || null;
}

// GET: جلب تقييمات كورس
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const courseSlug = searchParams.get("course");
  const userEmail = searchParams.get("user");

  if (!courseSlug) return NextResponse.json({ ok: false, error: "معرف الكورس مطلوب" }, { status: 400 });

  const sb = getSupabase();
  if (!sb) return NextResponse.json({ ok: false, error: "DB غير متاح" }, { status: 503 });

  let query = sb
    .from("ian_reviews")
    .select("*")
    .eq("course_slug", courseSlug)
    .order("created_at", { ascending: false });

  if (userEmail) {
    const userId = await getUserId(userEmail);
    if (userId) query = query.eq("user_id", userId);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

  // حساب الإحصائيات
  const reviews = data || [];
  const totalReviews = reviews.length;
  const avgRating = totalReviews > 0 
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews 
    : 0;
  const ratingDistribution = [1, 2, 3, 4, 5].map(stars => ({
    stars,
    count: reviews.filter(r => r.rating === stars).length,
    percentage: totalReviews > 0 ? Math.round((reviews.filter(r => r.rating === stars).length / totalReviews) * 100) : 0,
  }));

  return NextResponse.json({ 
    ok: true, 
    reviews,
    stats: {
      totalReviews,
      avgRating: Math.round(avgRating * 10) / 10,
      ratingDistribution,
    }
  });
}

// POST: إنشاء/تحديث تقييم (للمسجلين في الكورس)
export async function POST(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ ok: false, error: "غير مصرح" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { course_slug, rating, title, content } = body;

  if (!course_slug || !rating || rating < 1 || rating > 5) {
    return NextResponse.json({ ok: false, error: "بيانات ناقصة أو تقييم غير صحيح" }, { status: 400 });
  }

  const sb = getSupabase();
  if (!sb) return NextResponse.json({ ok: false, error: "DB غير متاح" }, { status: 503 });

  const userId = await getUserId(user.email);
  if (!userId) return NextResponse.json({ ok: false, error: "مستخدم غير موجود" }, { status: 404 });

  // التحقق من التسجيل في الكورس (اختياري - يمكن تفعيله)
  // const { data: enrollment } = await sb
  //   .from("ian_enrollments")
  //   .select("id")
  //   .eq("course_slug", course_slug)
  //   .eq("user_id", userId)
  //   .single();
  // if (!enrollment && user.role !== "admin") {
  //   return NextResponse.json({ ok: false, error: "يجب التسجيل في الكورس أولاً" }, { status: 403 });
  // }

  // التحقق من وجود تقييم سابق
  const { data: existing } = await sb
    .from("ian_reviews")
    .select("id")
    .eq("course_slug", course_slug)
    .eq("user_id", userId)
    .single();

  let result;
  if (existing) {
    // تحديث التقييم الموجود
    const { data, error } = await sb
      .from("ian_reviews")
      .update({ rating, title: title || "", content: content || "", updated_at: new Date().toISOString() })
      .eq("id", existing.id)
      .select()
      .single();
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    result = data;
  } else {
    // إنشاء تقييم جديد
    const { data, error } = await sb
      .from("ian_reviews")
      .insert({
        course_slug,
        user_id: userId,
        rating,
        title: title || "",
        content: content || "",
      })
      .select()
      .single();
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    result = data;
  }

  return NextResponse.json({ ok: true, review: result });
}

// DELETE: حذف تقييم (صاحب التقييم أو أدمن)
export async function DELETE(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ ok: false, error: "غير مصرح" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ ok: false, error: "معرف التقييم مطلوب" }, { status: 400 });

  const sb = getSupabase();
  if (!sb) return NextResponse.json({ ok: false, error: "DB غير متاح" }, { status: 503 });

  const userId = await getUserId(user.email);
  if (!userId) return NextResponse.json({ ok: false, error: "مستخدم غير موجود" }, { status: 404 });

  // جلب التقييم للتحقق من الصلاحية
  const { data: review } = await sb.from("ian_reviews").select("user_id").eq("id", id).single();
  if (!review) return NextResponse.json({ ok: false, error: "التقييم غير موجود" }, { status: 404 });

  if (review.user_id !== userId && user.role !== "admin") {
    return NextResponse.json({ ok: false, error: "غير مصرح" }, { status: 403 });
  }

  const { error } = await sb.from("ian_reviews").delete().eq("id", id);
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}