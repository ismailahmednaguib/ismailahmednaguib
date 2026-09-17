// app/api/test-email/route.ts : اختبار إرسال البريد (أدمن فقط)
import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { sendEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const u = await currentUser();
  if (!u || u.role !== "admin") return NextResponse.json({ error: "غير مصرح" }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const to = String(body.to || "").trim();

  if (!to || !to.includes("@")) {
    return NextResponse.json({ error: "بريد غير صالح" }, { status: 400 });
  }

  const email = {
    subject: "🧪 بريد اختبار من منصة إسماعيل أحمد نجيب",
    html: `
      <div style="font-family:Cairo,Tahoma,sans-serif;direction:rtl;max-width:600px;margin:auto;background:#f7f5ee;padding:20px;border-radius:12px">
        <div style="background:linear-gradient(135deg,#0b3d2e,#147052);color:#fff;padding:20px;border-radius:12px 12px 0 0;text-align:center">
          <h1 style="margin:0">اختبار الإرسال ✓</h1>
        </div>
        <div style="background:#fff;padding:20px;border-radius:0 0 12px 12px;border:1px solid #e6dfc9">
          <p style="font-size:16px;line-height:1.8">هذا بريد اختبار للتأكد من إعدادات الإرسال.</p>
          <p style="font-size:16px;line-height:1.8">إذا وصلت هذه الرسالة، فإعدادات <strong>Resend</strong> أو <strong>SendGrid</strong> تعمل بشكل صحيح.</p>
          <p style="font-size:13px;color:#6b766f">الوقت: ${new Date().toLocaleString("ar-EG")}</p>
        </div>
      </div>
    `,
    text: `اختبار الإرسال - إذا وصلت هذه الرسالة فإعدادات البريد تعمل بشكل صحيح. الوقت: ${new Date().toLocaleString("ar-EG")}`,
  };

  const result = await sendEmail({ to, ...email });
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}