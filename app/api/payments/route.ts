// app/api/payments/route.ts : إدارة المدفوعات
import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { currentUser } from "@/lib/auth";
import { createCheckoutSession } from "@/lib/stripe";

async function getUserId(email: string): Promise<string | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data } = await sb.from("ian_users").select("id").eq("email", email).single();
  return data?.id || null;
}

// POST: إنشاء جلسة دفع (Stripe Checkout)
export async function POST(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ ok: false, error: "غير مصرح" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { courseSlug, successUrl, cancelUrl } = body;

  if (!courseSlug) return NextResponse.json({ ok: false, error: "معرف الكورس مطلوب" }, { status: 400 });

  const sb = getSupabase();
  if (!sb) return NextResponse.json({ ok: false, error: "DB غير متاح" }, { status: 503 });

  const userId = await getUserId(user.email);
  if (!userId) return NextResponse.json({ ok: false, error: "مستخدم غير موجود" }, { status: 404 });

  // جلب بيانات الكورس
  const { data: course, error: courseError } = await sb
    .from("ian_courses")
    .select("slug, title, price")
    .eq("slug", courseSlug)
    .single();

  if (courseError || !course) return NextResponse.json({ ok: false, error: "الكورس غير موجود" }, { status: 404 });
  if (course.price === 0) return NextResponse.json({ ok: false, error: "هذا الكورس مجاني" }, { status: 400 });

  // التحقق من التسجيل المسبق
  const { data: existingEnrollment } = await sb
    .from("ian_enrollments")
    .select("id")
    .eq("course_slug", courseSlug)
    .eq("user_id", userId)
    .single();

  if (existingEnrollment) return NextResponse.json({ ok: false, error: "أنت مسجل مسبقاً في هذا الكورس" }, { status: 400 });

  // التحقق من وجود دفع معلق
  const { data: pendingPayment } = await sb
    .from("ian_payments")
    .select("id, status")
    .eq("user_id", userId)
    .eq("course_slug", courseSlug)
    .in("status", ["pending", "completed"])
    .single();

  if (pendingPayment) {
    if (pendingPayment.status === "completed") {
      return NextResponse.json({ ok: false, error: "الدفع مكتمل مسبقاً" }, { status: 400 });
    }
    // يمكن إعادة استخدام الجلسة المعلقة أو إنشاء واحدة جديدة
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const locale = "ar"; // يمكن تمريرها من العميل
  
  try {
    const session = await createCheckoutSession({
      userId,
      userEmail: user.email,
      courseSlug: course.slug,
      courseTitle: course.title,
      amount: course.price, // بالهللات
      currency: "sar",
      successUrl: successUrl || `${baseUrl}/${locale}/payments/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: cancelUrl || `${baseUrl}/${locale}/courses/${course.slug}`,
      metadata: {
        user_id: userId,
        course_slug: course.slug,
      },
    });

    // حفظ سجل الدفع
    const { data: payment, error: paymentError } = await sb
      .from("ian_payments")
      .insert({
        user_id: userId,
        course_slug: course.slug,
        amount: course.price,
        currency: "SAR",
        provider: "stripe",
        provider_session_id: session.id,
        status: "pending",
        metadata: {
          course_title: course.title,
          user_email: user.email,
        },
      })
      .select()
      .single();

    if (paymentError) {
      console.error("Payment record error:", paymentError);
    }

    return NextResponse.json({ ok: true, sessionId: session.id, url: session.url });
  } catch (error) {
    console.error("Stripe error:", error);
    return NextResponse.json({ ok: false, error: "فشل في إنشاء جلسة الدفع" }, { status: 500 });
  }
}

// GET: جلب مدفوعات المستخدم
export async function GET(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ ok: false, error: "غير مصرح" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const courseSlug = searchParams.get("course");
  const status = searchParams.get("status");

  const sb = getSupabase();
  if (!sb) return NextResponse.json({ ok: false, error: "DB غير متاح" }, { status: 503 });

  const userId = await getUserId(user.email);
  if (!userId) return NextResponse.json({ ok: false, error: "مستخدم غير موجود" }, { status: 404 });

  let query = sb.from("ian_payments").select("*").eq("user_id", userId);
  
  if (courseSlug) query = query.eq("course_slug", courseSlug);
  if (status) query = query.eq("status", status);
  
  query = query.order("created_at", { ascending: false });

  const { data, error } = await query;
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, payments: data || [] });
}