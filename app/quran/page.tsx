// app/quran/page.tsx : المدرسة القرآنية — كل النصوص من اللوحة
import Link from "next/link";
import { db } from "../../lib/db";
import { getSiteSettings } from "../../lib/site-settings";

export const dynamic = "force-dynamic";

export default async function Quran() {
  const allCourses = await db.courses();
  const allLessons = await db.lessons();
  const s = await getSiteSettings().catch(() => null);
  
  // تصفية المسار القرآني والمنشور فقط وترتيب حسب order
  const courses = allCourses
    .filter((c) => c.track === "quran" && c.published !== false)
    .sort((a, b) => (a.order || 0) - (b.order || 0));
  
  const lessons = allLessons
    .filter((l) => l.courseSlug.includes("tajweed") || l.courseSlug.includes("quran"))
    .sort((a, b) => (a.order || 0) - (b.order || 0));
  
  const t = (k: string, fb: string) => (s && (s as Record<string, string>)[k]) || fb;
  return (
    <>
      <section className="page-head wrap"><h1>📖 {t("quranTitle", "المدرسة القرآنية")}</h1><p>{t("quranDesc", "")}</p></section>
      <section className="wrap sec"><div className="sec-h"><h2>{t("quranCourses", "دورات القرآن")}</h2><Link href="/courses">{t("homeAllLink", "الكل ←")}</Link></div>
        <div className="grid">{courses.map((c) => (<div className="card" key={c.slug}><div className="pad"><b>{c.title}</b><span className="mut">{c.desc}</span><Link className="btn sm" href={`/courses/${c.slug}`}>{t("quranEnter", "ادخل الدورة")}</Link></div></div>))}</div></section>
      <section className="wrap sec"><div className="sec-h"><h2>{t("quranLessons", "دروس التجويد")}</h2></div>
        {lessons.map((l) => (<div className="lesson" key={l.id}><span>{l.title}</span>{l.videoUrl ? <a className="btn sm" href={l.videoUrl} target="_blank" rel="noreferrer">{t("quranWatch", "مشاهدة")}</a> : <span className="mut">{t("quranSoon", "قريبا")}</span>}</div>))}
        <div className="panel" style={{ marginTop: 12 }}><b>{t("quranIjazaTitle", "طلب إجازة مسندة:")}</b><p className="mut">{t("quranIjazaDesc", "")}</p><Link className="btn gold sm" href="/admission">{t("quranIjazaBtn", "طلب إجازة")}</Link></div>
      </section>
    </>
  );
}


