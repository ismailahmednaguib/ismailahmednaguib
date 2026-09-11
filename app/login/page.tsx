// app/login/page.tsx : الدخول فقط
interface Props {
  searchParams?: { [key: string]: string | string[] | undefined };
}

export default function Login({ searchParams }: Props) {
  const err = searchParams?.err === "1";
  return (<><section className="page-head wrap"><h1>دخول الإدارة</h1><p>خاص بالمشرف فقط — محمي ضد التخمين</p></section>
  <section className="wrap sec">
  {err && (<div className="panel" style={{ borderColor: "#b3261e" }}><b>بيانات الدخول غير صحيحة</b><p className="mut">تأكد من البريد وكلمة المرور وحاول مجددا.</p></div>)}
  <form className="frm" method="POST" action="/api/login">
  <label>البريد</label><input name="email" type="email" required dir="ltr" />
  <label>كلمة المرور</label><input name="password" type="password" required dir="ltr" />
  <button className="btn gold" type="submit">دخول</button></form>
  <p className="mut">أول تشغيل: admin@ian.local / IanAdmin123! — غيّرها فورا من لوحة التحكم.</p></section></>);
}

