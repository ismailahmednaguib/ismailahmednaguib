// app/lessons/[id]/page.tsx : تفاصيل الدرس
import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "../../../lib/db";
import { getSiteSettings } from "../../../lib/site-settings";
import { youtubeEmbed } from "../../../lib/youtube";

export const dynamic = "force-dynamic";
export const dynamicParams = true;

export default async function LessonDetail({ params }: { params: { id: string } }) {
  const lessons = await db.lessons();
  const l = lessons.find((x) => x.id === params.id);
  if (!l) return notFound();
  
  const course = (await db.courses()).find((c) => c.slug === l.courseSlug);
  
  // التحقق من النشر
  const u = await (await import("../../../lib/auth")).currentUser();
  if ((course?.published === false || l.free === false) && (!u || u.role !== "admin")) {
    return notFound();
  }
  
  const settings = await getSiteSettings().catch(() => null);
  const t = (k: string, fb: string) => (settings && (settings as Record<string, string>)[k]) || fb;
  const emb = l.videoUrl ? youtubeEmbed(l.videoUrl) : null;
  
  return (
    <>
      <section className="page-head wrap"><h1>{l.title}</h1><p className="mut">{course ? `${course.title} • ${l.duration}` : l.duration}</p></section>
      <section className="wrap sec">
        {emb ? (
          <div className="video" style={{ marginBottom: 20 }}>
            <iframe src={emb} allowFullScreen title={l.title} />
          </div>
        ) : (
          <p className="mut">{t("detailNoVideo", "لا يوجد فيديو لهذا الدرس")}</p>
        )}
        <div className="row" style={{ marginTop: 16, gap: 12, flexWrap: "wrap" }}>
          {course && <Link className="btn ghost" href={`/courses/${course.slug}`}>← العودة للدورة</Link>}
          <Link className="btn ghost" href="/quran">{t("detailAll", "كل الدروس")}</Link>
        </div>
      </section>
    </>
  );
}