// app/admission/page.tsx : التقديم — كل كلمة من اللوحة
import { db } from "../../lib/db";
import { getSiteSettings } from "../../lib/site-settings";
import { getTracks } from "../../lib/track-settings";
import type { Course } from "../../lib/types";

export const dynamic = "force-dynamic";

interface Props {
  searchParams?: { [key: string]: string | string[] | undefined };
}

export default async function Admission({ searchParams }: Props) {
  const allCourses: Course[] = await db.courses();
  const s = await getSiteSettings().catch(() => null);
  const tracks = await getTracks().catch(() => []);
  const ok = searchParams?.ok === "1";
  const t = (k: string, fb: string) => (s && (s as Record<string, string>)[k]) || fb;
  
  // فقط الدورات المنشورة
  const courses = allCourses.filter((c) => c.published !== false);
  
  return (<><section className="page-head wrap"><h1>{t("admissionTitle", "التقديم والالتحاق")}</h1><p>{t("admissionDesc", "")}</p></section>
  <section className="wrap sec">
  {ok && (<div className="panel" style={{ borderColor: "var(--g2)" }}><b>✓ {t("admissionOkTitle", "تم استلام طلبك بنجاح")}</b><p className="mut">{t("admissionOkDesc", "")}</p></div>)}
  <form className="frm" method="POST" action="/api/admission">
  <label>{t("admissionName", "الاسم الكامل")}</label><input name="name" required minLength={3} maxLength={80} />
  <label>{t("admissionPhone", "الهاتف / واتساب")}</label><input name="phone" required minLength={6} maxLength={20} />
  <label>{t("admissionEmail", "البريد الإلكتروني (اختياري)")}</label><input name="email" type="email" dir="ltr" />
  <label>{t("admissionTrack", "المسار")}</label><select name="track">{tracks.map((x) => (<option key={x.slug} value={x.slug}>{x.title}</option>))}</select>
  <label>{t("admissionCourse", "الدورة")}</label><select name="course">{courses.length ? courses.map((c) => (<option key={c.slug} value={c.title}>{c.title}</option>)) : (<option value="">{t("admissionNoCourses", "لا توجد دورات بعد")}</option>)}</select>
  <button className="btn gold" type="submit">{t("admissionSubmit", "إرسال الطلب")}</button></form></section></>);
}



