// app/api/payments/webhook/route.ts : Webhook ستريب
import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { handleWebhookEvent } from "@/lib/stripe";

export async function POST(req: Request) {
  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  const payload = await req.text();
  
  let event;
  try {
    event = await handleWebhookEvent(payload, signature);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Webhook signature verification failed" }, { status: 400 });
  }

  const sb = getSupabase();
  if (!sb) return NextResponse.json({ error: "DB unavailable" }, { status: 503 });

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const paymentIntentId = session.payment_intent;
        const sessionId = session.id;
        const userId = session.metadata?.user_id;
        const courseSlug = session.metadata?.course_slug;

        // تحديث حالة الدفع
        if (sessionId) {
          const { data: payment } = await sb
            .from("ian_payments")
            .select("id, user_id, course_slug")
            .eq("provider_session_id", sessionId)
            .single();

          if (payment) {
            await sb
              .from("ian_payments")
              .update({
                status: "completed",
                provider_payment_id: paymentIntentId,
                completed_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              })
              .eq("id", payment.id);

            // إنشاء تسجيل في الكورس
            if (payment.user_id && payment.course_slug) {
              const { data: existingEnrollment } = await sb
                .from("ian_enrollments")
                .select("id")
                .eq("user_id", payment.user_id)
                .eq("course_slug", payment.course_slug)
                .single();

              if (!existingEnrollment) {
                await sb.from("ian_enrollments").insert({
                  user_id: payment.user_id,
                  user_email: session.customer_details?.email || "",
                  user_name: session.customer_details?.name || "",
                  course_slug: payment.course_slug,
                  status: "active",
                });

                // إنشاء شهادة إذا كان الكورس مكتمل (يمكن ربطه بنظام الإكمال)
                // سيتم إنشاء الشهادة عند إكمال الكورس
              }
            }

            // إرسال إشعار
            if (payment?.user_id) {
              try {
                const { createNotification } = await import("@/lib/notifications");
                await createNotification({
                  userId: payment.user_id,
                  type: "success",
                  title: "تم الدفع بنجاح",
                  message: `تم تأكيد تسجيلك في الكورس`,
                  link: `/student/courses/${payment.course_slug}`,
                });
              } catch {
                // تجاهل خطأ الإشعار
              }
            }
          }
        }
        break;
      }

      case "checkout.session.expired": {
        const session = event.data.object;
        const sessionId = session.id;

        if (sessionId) {
          await sb
            .from("ian_payments")
            .update({
              status: "cancelled",
              updated_at: new Date().toISOString(),
            })
            .eq("provider_session_id", sessionId);
        }
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object;
        const sessionId = paymentIntent.metadata?.session_id;

        if (sessionId) {
          await sb
            .from("ian_payments")
            .update({
              status: "failed",
              updated_at: new Date().toISOString(),
            })
            .eq("provider_session_id", sessionId);
        }
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object;
        const paymentIntentId = charge.payment_intent;

        if (paymentIntentId) {
          const { data: payment } = await sb
            .from("ian_payments")
            .select("id")
            .eq("provider_payment_id", paymentIntentId)
            .single();

          if (payment) {
            await sb
              .from("ian_payments")
              .update({
                status: "refunded",
                updated_at: new Date().toISOString(),
              })
              .eq("id", payment.id);
          }
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook handler error:", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}