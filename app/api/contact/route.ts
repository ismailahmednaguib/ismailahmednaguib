// app/api/contact/route.ts : نموذج التواصل — إرسال للأدمن
import { NextResponse } from "next/server";
import { cleanText } from "@/lib/security";
import { sendEmail, adminNotificationEmail } from "@/lib/email";
import { getSiteSettings } from "@/lib/site-settings";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const form = await req.formData().catch(() => null);
  const raw: Record<string, unknown> = form
    ? Object.fromEntries((form as FormData).entries())
    : await req.json().catch(() => ({}));

  const name = cleanText(String(raw["name"] || ""), 80);
  const email = cleanText(String(raw["email"] || "").toLowerCase(), 120);
  const phone = cleanText(String(raw["phone"] || ""), 20);
  const subject = cleanText(String(raw["subject"] || ""), 120);
  const message = cleanText(String(raw["message"] || ""), 2000);

  if (!name || !email || !message) {
    return NextResponse.json({ error: "الاسم والبريد والرسالة مطلوبة" }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return NextResponse.json({ error: "بريد غير صحيح" }, { status: 400 });
  }

  const s = await getSiteSettings().catch(() => null);
  const adminEmail = s?.contactFormEmail || process.env.ADMIN_EMAIL || process.env.EMAIL_FROM;
  
  if (adminEmail) {
    const notify = adminNotificationEmail(
      `رسالة تواصل: ${subject || "بدون موضوع"}`,
      `<p><strong>من:</strong> ${name} (${email})</p>
       ${phone ? `<p><strong>هاتف:</strong> ${phone}</p>` : ""}
       <p><strong>الموضوع:</strong> ${subject || "—"}</p>
       <hr />
       <p>${message.replace(/\n/g, "<br>")}</p>`
    );
    if (notify) sendEmail(notify).catch(console.error);
  }

  // رد آلي للمرسل
  const autoReply = {
    subject: `✅ تم استلام رسالتك: ${subject || "تواصل"}`,
    html: `
      <div style="font-family:Cairo,Tahoma,sans-serif;direction:rtl;max-width:600px;margin:auto;background:#f7f5ee;padding:20px;border-radius:12px">
        <div style="background:linear-gradient(135deg,#0b3d2e,#147052);color:#fff;padding:20px;border-radius:12px 12px 0 0;text-align:center">
          <h1 style="margin:0">📬 تم استلام رسالتك</h1>
        </div>
        <div style="background:#fff;padding:20px;border-radius:0 0 12px 12px;border:1px solid #e6dfc9">
          <p>مرحباً <strong>${name}</strong>،</p>
          <p>شكراً لتواصلك معنا. Received your message about: <strong>${subject || "عام"}</strong>.</p>
          <p>سيراجع فريقنا رسالتك ويرد عليك في أقرب وقت ممكن.</p>
          <hr style="border-color:#e6dfc9;margin:16px 0" />
          <p style="font-size:13px;color:#6b766f">هذا رد آلي — لا ترد على هذا البريد.</p>
        </div>
      </div>
    `,
    text: `مرحباً ${name}، تم استلام رسالتك. الموضوع: ${subject}. سيرد عليك الفريق قريباً.`,
  };
  sendEmail({ to: email, ...autoReply }).catch(console.error);

  if (form) {
    return NextResponse.redirect(new URL("/contact?ok=1", req.url));
  }
  return NextResponse.json({ ok: true });
}