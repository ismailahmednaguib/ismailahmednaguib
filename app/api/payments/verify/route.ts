// app/api/payments/verify/route.ts : التحقق من الدفع
import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { getStripe } from "@/lib/stripe";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("session_id");

  if (!sessionId) return NextResponse.json({ ok: false, error: "معرف الجلسة مطلوب" }, { status: 400 });

  const sb = getSupabase();
  if (!sb) return NextResponse.json({ ok: false, error: "DB غير متاح" }, { status: 503 });

  const stripe = getStripe();
  if (!stripe) return NextResponse.json({ ok: false, error: "Stripe غير مهيأ" }, { status: 503 });

  try {
    // جلب الجلسة من ستريب
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["payment_intent", "line_items"],
    });

    // البحث عن الدفع في قاعدة البيانات
    const { data: payment } = await sb
      .from("ian_payments")
      .select("*")
      .eq("provider_session_id", sessionId)
      .single();

    if (!payment) {
      // محاولة إنشاء سجل إذا لم يكن موجوداً
      const userId = session.metadata?.user_id;
      const courseSlug = session.metadata?.course_slug;
      
      if (userId && courseSlug) {
        const { data: newPayment } = await sb
          .from("ian_payments")
          .insert({
            user_id: userId,
            course_slug: courseSlug,
            amount: session.amount_total || 0,
            currency: (session.currency || "sar").toUpperCase(),
            provider: "stripe",
            provider_session_id: sessionId,
            provider_payment_id: session.payment_intent as string,
            status: session.payment_status === "paid" ? "completed" : "pending",
            completed_at: session.payment_status === "paid" ? new Date().toISOString() : null,
            metadata: {
              course_title: (session.line_items?.data[0]?.price as any)?.product_data?.name || "",
              user_email: session.customer_details?.email || "",
            },
          })
          .select()
          .single();
        
        return NextResponse.json({ ok: true, payment: newPayment });
      }
      
      return NextResponse.json({ ok: false, error: "الدفع غير موجود" }, { status: 404 });
    }

    // تحديث الحالة إذا تغيرت
    if (session.payment_status === "paid" && payment.status !== "completed") {
      const { data: updatedPayment } = await sb
        .from("ian_payments")
        .update({
          status: "completed",
          provider_payment_id: session.payment_intent as string,
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", payment.id)
        .select()
        .single();
      
      return NextResponse.json({ ok: true, payment: updatedPayment });
    }

    return NextResponse.json({ ok: true, payment });
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json({ ok: false, error: "فشل في التحقق من الدفع" }, { status: 500 });
  }
}