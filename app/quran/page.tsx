// app/quran/page.tsx : المدرسة القرآنية — كل النصوص من اللوحة
import Link from "next/link";
import { db } from "../../lib/db";
import { getSiteSettings } from "../../lib/site-settings";

export const dynamic = "force-dynamic";

export default async function Quran() {
  const lessons = (await db.lessons()).filter((l) => l.courseSlug.includes("tajweed") || l.courseSlug.includes("quran"));
  const courses = (await db.courses()).filter((c) => c.track === "quran");
  const s = await getSiteSettings().catch(() => null);
  return (
    <>
      <section className="page-head wrap"><h1>📖 {s?.quranTitle || "المدرسة القرآنية"}</h1><p>{s?.quranDesc || ""}</p></section>
      <section className="wrap sec"><div className="sec-h"><h2>دورات القرآن</h2><Link href="/courses">الكل ←</Link></div>
        <div className="grid">{courses.map((c) => (<div className="card" key={c.slug}><div className="pad"><b>{c.title}</b><span className="mut">{c.desc}</span><Link className="btn sm" href={`/courses/${c.slug}`}>ادخل الدورة</Link></div></div>))}</div></section>
      <section className="wrap sec"><div className="sec-h"><h2>دروس التجويد</h2></div>
        {lessons.map((l) => (<div className="lesson" key={l.id}><span>{l.title}</span>{l.videoUrl ? <a className="btn sm" href={l.videoUrl} target="_blank" rel="noreferrer">مشاهدة</a> : <span className="mut">قريبا</span>}</div>))}
        <div className="panel" style={{ marginTop: 12 }}><b>طلب إجازة مسندة:</b><p className="mut">أتمم الحفظ والمراجعة ثم قدّم من صفحة التقديم واختر مسار المدرسة القرآنية.</p><Link className="btn gold sm" href="/admission">طلب إجازة</Link></div>
      </section>
    </>
  );
}

