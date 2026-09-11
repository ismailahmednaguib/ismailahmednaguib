// app/admission/page.tsx : التقديم فقط
import { db } from "../../lib/db";
import type { Course } from "../../lib/types";

export const dynamic = "force-dynamic";

interface Props {
  searchParams?: { [key: string]: string | string[] | undefined };
}

export default async function Admission({ searchParams }: Props) {
  const courses: Course[] = await db.courses();
  const ok = searchParams?.ok === "1";
  return (<><section className="page-head wrap"><h1>التقديم والالتحاق</h1><p>املأ الاستمارة وسيتواصل معك المشرف</p></section>
  <section className="wrap sec">
  {ok && (<div className="panel" style={{ borderColor: "var(--g2)" }}><b>✓ تم استلام طلبك بنجاح</b><p className="mut">سيتواصل معك المشرف قريبا. احتفظ برقم هاتفك متاحا.</p></div>)}
  <form className="frm" method="POST" action="/api/admission">
  <label>الاسم الكامل</label><input name="name" required minLength={3} maxLength={80} />
  <label>الهاتف / واتساب</label><input name="phone" required minLength={6} maxLength={20} />
  <label>المسار</label><select name="track"><option value="academy">الأكاديمية الشرعية</option><option value="institute">المعهد التدريبي</option><option value="quran">المدرسة القرآنية</option><option value="college">الأقسام الجامعية المصغرة</option></select>
  <label>الدورة</label><select name="course">{courses.map((c) => (<option key={c.slug} value={c.title}>{c.title}</option>))}</select>
  <button className="btn gold" type="submit">إرسال الطلب</button></form>
  <p className="mut">بعد الإرسال ستصلك رسالة تأكيد. تابع طلبك من لوحة التحكم (للمشرف).</p></section></>);
}

