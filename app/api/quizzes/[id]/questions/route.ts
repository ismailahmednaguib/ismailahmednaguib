// app/api/quizzes/[id]/questions/route.ts : إدارة أسئلة الاختبار
import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { requireAdmin } from "@/lib/auth";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ ok: false, error: "غير مصرح" }, { status: 403 });
  }

  const { id } = await params;
  const sb = getSupabase();
  if (!sb) return NextResponse.json({ ok: false, error: "DB غير متاح" }, { status: 503 });

  const { data, error } = await sb
    .from("ian_quiz_questions")
    .select("*, options:ian_quiz_options(*)")
    .eq("quiz_id", id)
    .order("order_index");

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, questions: data || [] });
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ ok: false, error: "غير مصرح" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const { question_text, question_type, explanation, points, order_index, options } = body;

  if (!question_text || !options || !options.length) {
    return NextResponse.json({ ok: false, error: "نص السؤال وخيارات مطلوبة" }, { status: 400 });
  }

  const sb = getSupabase();
  if (!sb) return NextResponse.json({ ok: false, error: "DB غير متاح" }, { status: 503 });

  // إنشاء السؤال
  const { data: question, error: qError } = await sb
    .from("ian_quiz_questions")
    .insert({
      quiz_id: id,
      question_text,
      question_type: question_type || "multiple_choice",
      explanation: explanation || "",
      points: points || 1,
      order_index: order_index || 0,
    })
    .select()
    .single();

  if (qError) return NextResponse.json({ ok: false, error: qError.message }, { status: 500 });

  // إنشاء الخيارات
  const optionRows = options.map((opt: any, index: number) => ({
    question_id: question.id,
    option_text: opt.option_text,
    is_correct: opt.is_correct || false,
    order_index: opt.order_index ?? index,
  }));

  const { data: createdOptions, error: oError } = await sb
    .from("ian_quiz_options")
    .insert(optionRows)
    .select();

  if (oError) {
    // تنظيف السؤال في حالة فشل إنشاء الخيارات
    await sb.from("ian_quiz_questions").delete().eq("id", question.id);
    return NextResponse.json({ ok: false, error: oError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, question: { ...question, options: createdOptions } });
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ ok: false, error: "غير مصرح" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const { question_id, ...updates } = body;
  if (!question_id) return NextResponse.json({ ok: false, error: "معرف السؤال مطلوب" }, { status: 400 });

  const sb = getSupabase();
  if (!sb) return NextResponse.json({ ok: false, error: "DB غير متاح" }, { status: 503 });

  // تحديث السؤال
  const { data: question, error: qError } = await sb
    .from("ian_quiz_questions")
    .update(updates)
    .eq("id", question_id)
    .eq("quiz_id", id)
    .select()
    .single();

  if (qError) return NextResponse.json({ ok: false, error: qError.message }, { status: 500 });

  // تحديث الخيارات إذا تم توفيرها
  if (body.options && body.options.length) {
    // حذف الخيارات القديمة
    await sb.from("ian_quiz_options").delete().eq("question_id", question_id);
    // إنشاء خيارات جديدة
    const optionRows = body.options.map((opt: any, index: number) => ({
      question_id: question_id,
      option_text: opt.option_text,
      is_correct: opt.is_correct || false,
      order_index: opt.order_index ?? index,
    }));
    await sb.from("ian_quiz_options").insert(optionRows);
  }

  return NextResponse.json({ ok: true, question });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ ok: false, error: "غير مصرح" }, { status: 403 });
  }

  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const questionId = searchParams.get("questionId");
  if (!questionId) return NextResponse.json({ ok: false, error: "معرف السؤال مطلوب" }, { status: 400 });

  const sb = getSupabase();
  if (!sb) return NextResponse.json({ ok: false, error: "DB غير متاح" }, { status: 503 });

  const { error } = await sb.from("ian_quiz_questions").delete().eq("id", questionId).eq("quiz_id", id);
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}