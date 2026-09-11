// app/dashboard/forms-3.tsx : الشهادات + الأمان فقط
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
export function FormSecurity() {
  return (
    <Sec id="security" title="الأمان — تغيير كلمة المرور">
      <form className="frm" method="POST" action="/api/password">
        <input name="old" type="password" placeholder="الحالية" required dir="ltr" />
        <input name="nw" type="password" placeholder="الجديدة 10 حروف على الأقل" required dir="ltr" />
        <button className="btn danger" type="submit">تغيير كلمة المرور</button>
      </form>
      <p className="mut">لا تشارك JWT_SECRET أبدا — فعّل تحقق بخطوتين في Vercel وGitHub.</p>
    </Sec>
  );
}
