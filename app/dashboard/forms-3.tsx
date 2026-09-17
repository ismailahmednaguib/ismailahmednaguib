// app/dashboard/forms-3.tsx : الشهادات برقم تسلسلي + الأمان (باسورد + إيميل مع رسائل) + إعدادات البريد
"use client";
import { useState } from "react";
import { Sec } from "./ui";

export function FormCert({ lastCode }: { lastCode?: string }) {
  return (
    <Sec id="certs" title="الشهادات — إصدار برقم تسلسلي رسمي">
      {lastCode && (<div className="panel" style={{ borderColor: "var(--g2)" }}><b>✓ تم إصدار الشهادة برقم: </b><span className="qrcode" dir="ltr">{lastCode}</span><br /><a className="btn sm gold" style={{ marginTop: 8 }} href={`/verify?code=${encodeURIComponent(lastCode)}`} target="_blank" rel="noreferrer">عرض وطباعة الشهادة</a></div>)}
      <form className="frm" method="POST" action="/api/admin/certificates">
        <div className="row"><input name="student" placeholder="اسم الطالب" required /><input name="course" placeholder="الدورة" required /></div>
        <div className="row"><input name="grade" placeholder="التقدير (مثال: ممتاز)" /><input name="date" placeholder="2026-01-01" /></div>
        <button className="btn gold" type="submit">إصدار شهادة برقم تلقائي</button>
      </form>
      <p className="mut">الترقيم تسلسلي رسمي لا يتكرر (IAN-YYYY-XXXX) — يظهر بعد الإصدار مع زر عرض وطباعة.</p>
    </Sec>
  );
}

export function FormEmailSettings() {
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [testEmail, setTestEmail] = useState("");

  const testSend = async () => {
    if (!testEmail) return setMsg("أدخل بريداً للاختبار");
    setBusy(true);
    setMsg("جار الإرسال...");
    try {
      const res = await fetch("/api/test-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: testEmail }),
      });
      const j = await res.json();
      setMsg(j.ok ? "✓ تم إرسال بريد الاختبار بنجاح" : "فشل: " + (j.error || "غير معروف"));
    } catch {
      setMsg("خطأ شبكة");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Sec id="email-settings" title="إعدادات البريد الإلكتروني — Resend / SendGrid">
      <p className="mut">أضف مفاتيح API في متغيرات البيئة (.env) ثم اختبر الإرسال.</p>
      <div className="grid" style={{ marginBottom: 16 }}>
        <div>
          <label>RESEND_API_KEY</label>
          <input type="password" value={process.env.RESEND_API_KEY || ""} readOnly style={{ background: "#f5f5f5" }} />
          <small className="mut">{process.env.RESEND_API_KEY ? "✓ مضبوط" : "غير مضبوط"}</small>
        </div>
        <div>
          <label>SENDGRID_API_KEY</label>
          <input type="password" value={process.env.SENDGRID_API_KEY || ""} readOnly style={{ background: "#f5f5f5" }} />
          <small className="mut">{process.env.SENDGRID_API_KEY ? "✓ مضبوط" : "غير مضبوط"}</small>
        </div>
        <div>
          <label>EMAIL_FROM</label>
          <input value={process.env.EMAIL_FROM || ""} readOnly style={{ background: "#f5f5f5" }} />
          <small className="mut">{process.env.EMAIL_FROM ? "✓ مضبوط" : "غير مضبوط"}</small>
        </div>
        <div>
          <label>ADMIN_EMAIL</label>
          <input value={process.env.ADMIN_EMAIL || ""} readOnly style={{ background: "#f5f5f5" }} />
          <small className="mut">{process.env.ADMIN_EMAIL ? "✓ مضبوط" : "غير مضبوط"}</small>
        </div>
      </div>
      <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
        <input type="email" placeholder="بريد للاختبار" value={testEmail} onChange={e => setTestEmail(e.target.value)} className="btn sm ghost" style={{ flex: 1, minWidth: 250 }} />
        <button className="btn gold" onClick={testSend} disabled={busy}>{busy ? "⏳ جاري الإرسال..." : "📧 إرسال بريد اختبار"}</button>
      </div>
      {msg && <p className="mut" style={{ marginTop: 8 }}>{msg}</p>}
    </Sec>
  );
}

const PW_MSG: Record<string, string> = {
  ok: "✓ تم تغيير كلمة المرور بنجاح",
  no_old: "أدخل كلمة المرور الحالية",
  short: "الجديدة قصيرة — 10 حروف على الأقل",
  mismatch: "تأكيد الجديدة غير متطابق",
  same: "الجديدة مثل الحالية — اختر واحدة مختلفة",
  wrong: "كلمة المرور الحالية خطأ",
  nouser: "لا يوجد مستخدم — سجل دخول من جديد",
};

const EM_MSG: Record<string, string> = {
  ok: "✓ تم تغيير البريد بنجاح",
  bad: "البريد الجديد غير صالح",
  same: "هذا نفس بريدك الحالي",
  exists: "هذا البريد مستخدم بالفعل",
  wrong: "كلمة المرور خطأ — لم يتم التغيير",
  nouser: "لا يوجد مستخدم — سجل دخول من جديد",
};

export function FormSecurity({ searchParams }: { searchParams?: { [key: string]: string | string[] | undefined } }) {
  const pw = typeof searchParams?.pw === "string" ? searchParams.pw : "";
  const em = typeof searchParams?.em === "string" ? searchParams.em : "";
  const reason = typeof searchParams?.reason === "string" ? searchParams.reason : "";
  return (
    <Sec id="security" title="الأمان — البريد وكلمة المرور">
      <h4 style={{ margin: "0 0 6px" }}>تغيير كلمة المرور</h4>
      {pw === "ok" && (<div className="panel" style={{ borderColor: "var(--g2)" }}><b>{PW_MSG.ok}</b></div>)}
      {pw === "err" && (<div className="panel" style={{ borderColor: "#b3261e" }}><b>تعذر التغيير:</b> {PW_MSG[reason] || "خطأ غير معروف"}</div>)}
      <form className="frm" method="POST" action="/api/password">
        <label>كلمة المرور الحالية</label>
        <input name="old" type="password" placeholder="الحالية" required dir="ltr" autoComplete="current-password" />
        <label>الجديدة (10 حروف على الأقل)</label>
        <input name="nw" type="password" placeholder="الجديدة" required minLength={10} dir="ltr" autoComplete="new-password" />
        <label>تأكيد الجديدة</label>
        <input name="nw2" type="password" placeholder="أعد كتابة الجديدة" required dir="ltr" autoComplete="new-password" />
        <button className="btn danger" type="submit">تغيير كلمة المرور</button>
      </form>
      <h4 style={{ margin: "14px 0 6px" }}>تغيير البريد الإلكتروني</h4>
      {em === "ok" && (<div className="panel" style={{ borderColor: "var(--g2)" }}><b>{EM_MSG.ok}</b></div>)}
      {em === "err" && (<div className="panel" style={{ borderColor: "#b3261e" }}><b>تعذر التغيير:</b> {EM_MSG[reason] || "خطأ غير معروف"}</div>)}
      <form className="frm" method="POST" action="/api/email">
        <label>البريد الجديد</label>
        <input name="newEmail" type="email" placeholder="name@mail.com" required dir="ltr" />
        <label>كلمة المرور الحالية (للتأكيد)</label>
        <input name="password" type="password" placeholder="الحالية" required dir="ltr" autoComplete="current-password" />
        <button className="btn gold" type="submit">تغيير البريد</button>
      </form>
      <p className="mut">بيانات الدخول محفوظة بشكل دائم وآمن. احتفظ بكلمة مرور قوية ولا تشاركها.</p>
    </Sec>
  );
}

