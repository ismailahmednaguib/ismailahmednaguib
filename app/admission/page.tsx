// app/admission/page.tsx : التقديم — كل النصوص من اللوحة
import { db } from "../../lib/db";
import { getSiteSettings } from "../../lib/site-settings";
import { getTracks } from "../../lib/track-settings";
import type { Course } from "../../lib/types";

export const dynamic = "force-dynamic";

interface Props {
  searchParams?: { [key: string]: string | string[] | undefined };
}

export default async function Admission({ searchParams }: Props) {
  const courses: Course[] = await db.courses();
  const s = await getSiteSettings().catch(() => null);
  const tracks = await getTracks().catch(() => []);
  const ok = searchParams?.ok === "1";
  return (<><section className="page-head wrap"><h1>{s?.admissionTitle || "التقديم والالتحاق"}</h1><p>{s?.admissionDesc || ""}</p></section>
  <section className="wrap sec">
  {ok && (<div className="panel" style={{ borderColor: "var(--g2)" }}><b>✓ {s?.admissionOkTitle || "تم استلام طلبك بنجاح"}</b><p className="mut">{s?.admissionOkDesc || ""}</p></div>)}
  <form className="frm" method="POST" action="/api/admission">
  <label>الاسم الكامل</label><input name="name" required minLength={3} maxLength={80} />
  <label>الهاتف / واتساب</label><input name="phone" required minLength={6} maxLength={20} />
  <label>المسار</label><select name="track">{tracks.map((t) => (<option key={t.slug} value={t.slug}>{t.title}</option>))}</select>
  <label>الدورة</label><select name="course">{courses.length ? courses.map((c) => (<option key={c.slug} value={c.title}>{c.title}</option>)) : (<option value="">لا توجد دورات بعد</option>)}</select>
  <button className="btn gold" type="submit">إرسال الطلب</button></form></section></>);
}


