// app/dashboard/forms-3.tsx : الشهادات + الأمان فقط (باسورد + إيميل مع رسائل)
import { Sec } from "./ui";

export function FormCert() {
  return (
    <Sec id="certs" title="الشهادات — إصدار بكود تحقق">
      <form className="frm" method="POST" action="/api/admin/certificates">
        <div className="row"><input name="student" placeholder="اسم الطالب" required /><input name="course" placeholder="الدورة" required /></div>
        <div className="row"><input name="grade" placeholder="التقدير" /><input name="date" placeholder="2026-09-11" /></div>
        <button className="btn gold" type="submit">إصدار شهادة (كود تلقائي)</button>
      </form>
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

