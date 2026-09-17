// app/api/quizzes/route.ts : إدارة الاختبارات
import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { currentUser, requireAdmin } from "@/lib/auth";

// GET: قائمة الاختبارات (للأدمن) أو اختبار واحد (للطالب)
export async function GET(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ ok: false, error: "غير مصرح" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const quizId = searchParams.get("id");
  const courseSlug = searchParams.get("course");
  const lessonId = searchParams.get("lesson");
  const published = searchParams.get("published") === "true";

  const sb = getSupabase();
  if (!sb) return NextResponse.json({ ok: false, error: "DB غير متاح" }, { status: 503 });

  // اختبار واحد مع الأسئلة (للطالب)
  if (quizId) {
    const { data: quiz, error: quizError } = await sb
      .from("ian_quizzes")
      .select("*")
      .eq("id", quizId)
      .single();

    if (quizError || !quiz) return NextResponse.json({ ok: false, error: "الاختبار غير موجود" }, { status: 404 });

    // التحقق من الصلاحية: الأدمن يرى كل شيء، الطالب يرى المنشور فقط
    if (!quiz.published && user.role !== "admin") {
      return NextResponse.json({ ok: false, error: "الاختبار غير متاح" }, { status: 403 });
    }

    // جلب الأسئلة مع الخيارات
    const { data: questions, error: qError } = await sb
      .from("ian_quiz_questions")
      .select("*, options:ian_quiz_options(*)")
      .eq("quiz_id", quizId)
      .order("order_index");

    if (qError) return NextResponse.json({ ok: false, error: qError.message }, { status: 500 });

    // للطالب: إخفاء الإجابات الصحيحة
    const questionsForStudent = questions?.map((q) => ({
      ...q,
      options: q.options?.map((o: { id: string; option_text: string; order_index: number }) => ({
        id: o.id,
        option_text: o.option_text,
        order_index: o.order_index,
      })) || [],
    })) || [];

    // جلب محاولات المستخدم السابقة
    const userId = await getUserId(user.email);
    let attempts: any[] = [];
    if (userId) {
      const { data: userAttempts } = await sb
        .from("ian_quiz_attempts")
        .select("*")
        .eq("quiz_id", quizId)
        .eq("user_id", userId)
        .order("started_at", { ascending: false });
      attempts = userAttempts || [];
    }

    return NextResponse.json({
      ok: true,
      quiz: { ...quiz, questions: user.role === "admin" ? questions : questionsForStudent },
      attempts,
      canAttempt: user.role !== "admin" && quiz.published,
    });
  }

  // قائمة الاختبارات (للأدمن أو لكورس محدد)
  if (user.role === "admin" || courseSlug) {
    let query = sb.from("ian_quizzes").select("*");
    
    if (courseSlug) query = query.eq("course_slug", courseSlug);
    if (published && user.role !== "admin") query = query.eq("published", true);
    if (lessonId) query = query.eq("lesson_id", lessonId);
    
    query = query.order("created_at", { ascending: false });

    const { data, error } = await query;
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

    return NextResponse.json({ ok: true, quizzes: data || [] });
  }

  return NextResponse.json({ ok: false, error: "معرفات مطلوبة" }, { status: 400 });
}

async function getUserId(email: string): Promise<string | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data } = await sb.from("ian_users").select("id").eq("email", email).single();
  return data?.id || null;
}

// POST: إنشاء اختبار جديد (أدمن فقط)
export async function POST(req: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ ok: false, error: "غير مصرح" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const { course_slug, lesson_id, title, description, time_limit, passing_score, max_attempts, shuffle_questions, shuffle_options, show_correct_answers, published } = body;

  if (!course_slug || !title) return NextResponse.json({ ok: false, error: "كورس وعنوان مطلوبان" }, { status: 400 });

  const sb = getSupabase();
  if (!sb) return NextResponse.json({ ok: false, error: "DB غير متاح" }, { status: 503 });

  const { data, error } = await sb
    .from("ian_quizzes")
    .insert({
      course_slug,
      lesson_id: lesson_id || null,
      title,
      description: description || "",
      time_limit: time_limit || null,
      passing_score: passing_score || 60,
      max_attempts: max_attempts || 3,
      shuffle_questions: shuffle_questions ?? true,
      shuffle_options: shuffle_options ?? true,
      show_correct_answers: show_correct_answers ?? true,
      published: published || false,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, quiz: data });
}

// PUT: تحديث اختبار (أدمن فقط)
export async function PUT(req: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ ok: false, error: "غير مصرح" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const { id, ...updates } = body;
  if (!id) return NextResponse.json({ ok: false, error: "معرف الاختبار مطلوب" }, { status: 400 });

  const sb = getSupabase();
  if (!sb) return NextResponse.json({ ok: false, error: "DB غير متاح" }, { status: 503 });

  const { data, error } = await sb
    .from("ian_quizzes")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, quiz: data });
}

// DELETE: حذف اختبار (أدمن فقط)
export async function DELETE(req: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ ok: false, error: "غير مصرح" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ ok: false, error: "معرف الاختبار مطلوب" }, { status: 400 });

  const sb = getSupabase();
  if (!sb) return NextResponse.json({ ok: false, error: "DB غير متاح" }, { status: 503 });

  const { error } = await sb.from("ian_quizzes").delete().eq("id", id);
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}