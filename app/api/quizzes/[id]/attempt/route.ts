// app/api/quizzes/[id]/attempt/route.ts : تقديم الاختبار
import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { currentUser } from "@/lib/auth";

async function getUserId(email: string): Promise<string | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data } = await sb.from("ian_users").select("id").eq("email", email).single();
  return data?.id || null;
}

// POST: بدء/إرسال محاولة اختبار
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ ok: false, error: "غير مصرح" }, { status: 401 });

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const { answers, time_spent } = body; // answers: { question_id: option_id[] }

  const sb = getSupabase();
  if (!sb) return NextResponse.json({ ok: false, error: "DB غير متاح" }, { status: 503 });

  const userId = await getUserId(user.email);
  if (!userId) return NextResponse.json({ ok: false, error: "مستخدم غير موجود" }, { status: 404 });

  // جلب الاختبار
  const { data: quiz, error: quizError } = await sb
    .from("ian_quizzes")
    .select("*")
    .eq("id", id)
    .single();

  if (quizError || !quiz) return NextResponse.json({ ok: false, error: "الاختبار غير موجود" }, { status: 404 });
  if (!quiz.published) return NextResponse.json({ ok: false, error: "الاختبار غير متاح" }, { status: 403 });

  // التحقق من عدد المحاولات
  const { data: attempts } = await sb
    .from("ian_quiz_attempts")
    .select("id")
    .eq("quiz_id", id)
    .eq("user_id", userId);

  const attemptCount = attempts?.length || 0;
  if (attemptCount >= quiz.max_attempts) {
    return NextResponse.json({ ok: false, error: "لقد استنفدت عدد المحاولات المسموحة" }, { status: 400 });
  }

  // إذا لم يتم إرسال إجابات، إنشاء محاولة جديدة (بدء الاختبار)
  if (!answers) {
    const { data: attempt, error } = await sb
      .from("ian_quiz_attempts")
      .insert({
        quiz_id: id,
        user_id: userId,
        score: 0,
        max_score: 0,
        percentage: 0,
        passed: false,
        answers: {},
        time_spent: 0,
      })
      .select()
      .single();

    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

    return NextResponse.json({ ok: true, attempt });
  }

  // جلب الأسئلة مع الإجابات الصحيحة للتصحيح
  const { data: questions, error: qError } = await sb
    .from("ian_quiz_questions")
    .select("*, options:ian_quiz_options(id, is_correct)")
    .eq("quiz_id", id);

  if (qError) return NextResponse.json({ ok: false, error: qError.message }, { status: 500 });

  // حساب الدرجة
  let totalScore = 0;
  let maxScore = 0;

  for (const question of questions || []) {
    maxScore += question.points;
    const userAnswers = answers[question.id] || [];
    const correctOptions = question.options?.filter((o: { is_correct: boolean; id: string }) => o.is_correct).map((o: { id: string }) => o.id) || [];
    
    // التحقق من الإجابة الصحيحة
    const isCorrect = 
      correctOptions.length === userAnswers.length &&
      correctOptions.every((opt: string) => userAnswers.includes(opt));
    
    if (isCorrect) {
      totalScore += question.points;
    }
  }

  const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
  const passed = percentage >= quiz.passing_score;

  // حفظ المحاولة
  const { data: attempt, error } = await sb
    .from("ian_quiz_attempts")
    .insert({
      quiz_id: id,
      user_id: userId,
      score: totalScore,
      max_score: maxScore,
      percentage,
      passed,
      answers,
      time_spent: time_spent || 0,
      completed_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

  // إذا نجح، إرسال إشعار
  if (passed) {
    try {
      const { createNotification } = await import("@/lib/notifications");
      await createNotification({
        userId,
        type: "success",
        title: "نجاح في الاختبار",
        message: `تهانينا! نجحت في اختبار "${quiz.title}" بنسبة ${percentage}%`,
        link: `/student/quizzes/${id}`,
      });
    } catch {
      // تجاهل خطأ الإشعار
    }
  }

  return NextResponse.json({ ok: true, attempt, result: { score: totalScore, maxScore, percentage, passed } });
}

// GET: جلب محاولات المستخدم للاختبار
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ ok: false, error: "غير مصرح" }, { status: 401 });

  const { id } = await params;
  const sb = getSupabase();
  if (!sb) return NextResponse.json({ ok: false, error: "DB غير متاح" }, { status: 503 });

  const userId = await getUserId(user.email);
  if (!userId) return NextResponse.json({ ok: false, error: "مستخدم غير موجود" }, { status: 404 });

  const { data, error } = await sb
    .from("ian_quiz_attempts")
    .select("*")
    .eq("quiz_id", id)
    .eq("user_id", userId)
    .order("started_at", { ascending: false });

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, attempts: data || [] });
}