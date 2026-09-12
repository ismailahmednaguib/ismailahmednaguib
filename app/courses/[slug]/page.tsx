// app/courses/[slug]/page.tsx : تفاصيل الدورة + الدروس والفيديو — يوتيوب بكل صيغه
import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "../../../lib/db";
import { youtubeEmbed } from "../../../lib/youtube";

export const dynamic = "force-dynamic";
export const dynamicParams = true;

export default async function CourseDetail({ params }: { params: { slug: string } }) {
  const courses = await db.courses();
  const c = courses.find((x) => x.slug === params.slug);
  if (!c) return notFound();
  const lessons = (await db.lessons()).filter((l) => l.courseSlug === c.slug);
  const emb = c.videoUrl ? youtubeEmbed(c.videoUrl) : null;
  return (
    <>
      <section className="page-head wrap"><span className="kicker">{c.track} • {c.level}</span><h1>{c.title}</h1><p>{c.teacher} • {c.hours} ساعة • {c.price === 0 ? "مجاني" : c.price + " ج"}</p></section>
      <section className="wrap sec"><p>{c.desc}</p>
        {emb ? (<div className="video"><iframe src={emb} allowFullScreen title={c.title} /></div>) : (<p className="mut">الفيديو التعريفي يضاف من لوحة التحكم.</p>)}
        <h3>الدروس ({lessons.length})</h3>
        {lessons.map((l) => (
          <div className="lesson" key={l.id}><span>{l.free ? "🟢" : "🔒"} {l.title} <small className="mut">{l.duration}</small></span>
            {l.videoUrl ? <a className="btn sm" href={l.videoUrl} target="_blank" rel="noreferrer">مشاهدة</a> : <span className="mut">قريبا</span>}</div>
        ))}
        <div className="row" style={{ marginTop: 12 }}><Link className="btn gold" href="/admission">التحق بالدورة</Link><Link className="btn ghost" href="/courses">كل الدورات</Link></div>
      </section>
    </>
  );
}

