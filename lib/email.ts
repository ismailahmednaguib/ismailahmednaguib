// lib/email.ts : نظام الإشعارات بالبريد الإلكتروني — يدعم Resend و SendGrid
// متغيرات البيئة: RESEND_API_KEY أو SENDGRID_API_KEY + EMAIL_FROM

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

async function sendWithResend(options: EmailOptions): Promise<{ ok: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || "noreply@yourdomain.com";
  if (!apiKey) return { ok: false, error: "RESEND_API_KEY غير مضبوط" };
  
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: Array.isArray(options.to) ? options.to : [options.to],
        subject: options.subject,
        html: options.html,
        text: options.text,
      }),
    });
    const data = await res.json();
    if (!res.ok) return { ok: false, error: data.message || "فشل الإرسال عبر Resend" };
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

async function sendWithSendGrid(options: EmailOptions): Promise<{ ok: boolean; error?: string }> {
  const apiKey = process.env.SENDGRID_API_KEY;
  const from = process.env.EMAIL_FROM || "noreply@yourdomain.com";
  if (!apiKey) return { ok: false, error: "SENDGRID_API_KEY غير مضبوط" };
  
  try {
    const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        personalizations: [{ to: Array.isArray(options.to) ? options.to.map(e => ({ email: e })) : [{ email: options.to }] }],
        from: { email: from },
        subject: options.subject,
        content: [
          { type: "text/html", value: options.html },
          ...(options.text ? [{ type: "text/plain", value: options.text }] : []),
        ],
      }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return { ok: false, error: data.errors?.[0]?.message || "فشل الإرسال عبر SendGrid" };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

export async function sendEmail(options: EmailOptions): Promise<{ ok: boolean; error?: string }> {
  // جرب Resend أولاً ثم SendGrid
  if (process.env.RESEND_API_KEY) {
    const result = await sendWithResend(options);
    if (result.ok) return result;
    console.warn("Resend failed, trying SendGrid:", result.error);
  }
  if (process.env.SENDGRID_API_KEY) {
    return sendWithSendGrid(options);
  }
  return { ok: false, error: "لا يوجد مزود بريد مهيأ (RESEND_API_KEY أو SENDGRID_API_KEY)" };
}

// قوالب بريد جاهزة
export function welcomeEmail(studentName: string, courseTitle: string, loginUrl: string) {
  return {
    subject: `مرحباً بك في ${courseTitle}!`,
    html: `
      <div style="font-family:Cairo,Tahoma,sans-serif;direction:rtl;max-width:600px;margin:auto;background:#f7f5ee;padding:20px;border-radius:12px">
        <div style="background:linear-gradient(135deg,#0b3d2e,#147052);color:#fff;padding:20px;border-radius:12px 12px 0 0;text-align:center">
          <h1 style="margin:0">🎓 مرحباً ${studentName}!</h1>
        </div>
        <div style="background:#fff;padding:20px;border-radius:0 0 12px 12px;border:1px solid #e6dfc9">
          <p style="font-size:16px;line-height:1.8">تم تسجيلك بنجاح في دورة <strong>${courseTitle}</strong>.</p>
          <p style="font-size:16px;line-height:1.8">يمكنك الآن الدخول لبوابة الطالب وبدء التعلم:</p>
          <div style="text-align:center;margin:24px 0">
            <a href="${loginUrl}" style="background:linear-gradient(135deg,#c9a227,#8a6f10);color:#fff;padding:14px 28px;border-radius:10px;text-decoration:none;font-weight:700;display:inline-block">📚 دخول البوابة</a>
          </div>
          <p style="font-size:13px;color:#6b766f">إذا لم تقم بالتسجيل، يرجى تجاهل هذه الرسالة.</p>
        </div>
      </div>
    `,
    text: `مرحباً ${studentName}، تم تسجيلك في ${courseTitle}. ادخل من: ${loginUrl}`,
  };
}

export function certificateEmail(studentName: string, courseTitle: string, certificateCode: string, verifyUrl: string) {
  return {
    subject: `🎉 شهادة إتمام: ${courseTitle}`,
    html: `
      <div style="font-family:Cairo,Tahoma,sans-serif;direction:rtl;max-width:600px;margin:auto;background:#f7f5ee;padding:20px;border-radius:12px">
        <div style="background:linear-gradient(135deg,#0b3d2e,#147052);color:#fff;padding:20px;border-radius:12px 12px 0 0;text-align:center">
          <h1 style="margin:0">📜 مبروك ${studentName}!</h1>
        </div>
        <div style="background:#fff;padding:20px;border-radius:0 0 12px 12px;border:1px solid #e6dfc9">
          <p style="font-size:16px;line-height:1.8">تهانينا! لقد أكملت دورة <strong>${courseTitle}</strong> بنجاح.</p>
          <p style="font-size:16px;line-height:1.8">رقم شهادتك: <strong dir="ltr">${certificateCode}</strong></p>
          <div style="text-align:center;margin:24px 0">
            <a href="${verifyUrl}" style="background:linear-gradient(135deg,#c9a227,#8a6f10);color:#fff;padding:14px 28px;border-radius:10px;text-decoration:none;font-weight:700;display:inline-block">🔍 تحقق من الشهادة</a>
          </div>
          <p style="font-size:13px;color:#6b766f">يمكنك طباعة الشهادة من صفحة التحقق.</p>
        </div>
      </div>
    `,
    text: `مبروك ${studentName}! أكملت ${courseTitle}. شهادتك: ${certificateCode}. تحقق: ${verifyUrl}`,
  };
}

export function admissionConfirmationEmail(name: string, track: string, course: string) {
  return {
    subject: `✅ تم استلام طلب التقديم: ${track} - ${course}`,
    html: `
      <div style="font-family:Cairo,Tahoma,sans-serif;direction:rtl;max-width:600px;margin:auto;background:#f7f5ee;padding:20px;border-radius:12px">
        <div style="background:linear-gradient(135deg,#0b3d2e,#147052);color:#fff;padding:20px;border-radius:12px 12px 0 0;text-align:center">
          <h1 style="margin:0">📝 تم استلام طلبك</h1>
        </div>
        <div style="background:#fff;padding:20px;border-radius:0 0 12px 12px;border:1px solid #e6dfc9">
          <p style="font-size:16px;line-height:1.8">مرحباً <strong>${name}</strong>،</p>
          <p style="font-size:16px;line-height:1.8">شكراً لتقديمك على <strong>${course}</strong> في مسار <strong>${track}</strong>.</p>
          <p style="font-size:16px;line-height:1.8">سيتواصل معك المشرف قريباً. يرجى إبقاء هاتفك متاحاً.</p>
        </div>
      </div>
    `,
    text: `مرحباً ${name}، تم استلام طلبك على ${course} (${track}). سيتواصل معك المشرف قريباً.`,
  };
}

export function adminNotificationEmail(subject: string, message: string) {
  const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_FROM;
  if (!adminEmail) return null;
  return {
    to: adminEmail,
    subject: `🔔 ${subject}`,
    html: `
      <div style="font-family:Cairo,Tahoma,sans-serif;direction:rtl;max-width:600px;margin:auto;background:#f7f5ee;padding:20px;border-radius:12px">
        <div style="background:linear-gradient(135deg,#0b3d2e,#147052);color:#fff;padding:20px;border-radius:12px 12px 0 0;text-align:center">
          <h1 style="margin:0">إشعار إداري</h1>
        </div>
        <div style="background:#fff;padding:20px;border-radius:0 0 12px 12px;border:1px solid #e6dfc9">
          ${message}
        </div>
      </div>
    `,
    text: message.replace(/<[^>]*>/g, ""),
  };
}