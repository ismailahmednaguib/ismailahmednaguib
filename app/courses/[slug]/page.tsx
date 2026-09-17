// app/courses/[slug]/page.tsx : تفاصيل الدورة + الدروس — كل كلمة من اللوحة + تسجيل للطلاب
import { notFound } from "next/navigation";
import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "../../../lib/db";
import { youtubeEmbed } from "../../../lib/youtube";
import { getSiteSettings } from "../../../lib/site-settings";
import { currentUser } from "../../../lib/auth";
import { getStudentEnrollments } from "../../../lib/enrollment";

export const dynamic = "force-dynamic";
export const dynamicParams = true;

export default async function CourseDetail({ params }: { params: { slug: string } }) {
  const courses = await db.courses();
  const c = courses.find((x) => x.slug === params.slug);
  if (!c) return notFound();
  
  // التحقق من النشر (الإدارة ترى كل شيء)
  const u = await currentUser();
  if (c.published === false && (!u || u.role !== "admin")) {
    return notFound();
  }
  
  const allLessons = (await db.lessons()).filter((l) => l.courseSlug === c.slug);
  const lessons = allLessons.sort((a, b) => (a.order || 0) - (b.order || 0));
  const s = await getSiteSettings().catch(() => null);
  const t = (k: string, fb: string) => (s && (s as Record<string, string>)[k]) || fb;
  const emb = c.videoUrl ? youtubeEmbed(c.videoUrl) : null;
  
  // التحقق من تسجيل الطالب
  let enrollment = null;
  if (u && u.role !== "admin") {
    const enrollments = await getStudentEnrollments(u.email);
    enrollment = enrollments.find(e => e.courseSlug === c.slug) || null;
  }

  return (
    <>
      <section className="page-head wrap"><span className="kicker">{c.track} • {c.level}</span><h1>{c.title}</h1><p>{c.teacher} • {c.hours} ساعة • {c.price === 0 ? t("detailFree", "مجاني") : c.price + " ج"}</p></section>
      <section className="wrap sec"><p>{c.desc}</p>
        {emb ? (<div className="video"><iframe src={emb} allowFullScreen title={c.title} /></div>) : (<p className="mut">{t("detailNoVideo", "")}</p>)}
        <h3>{t("detailLessons", "الدروس")} ({lessons.length})</h3>
        {lessons.map((l) => (
          <div className="lesson" key={l.id}><span>{l.free ? "🟢" : "🔒"} {l.title} <small className="mut">{l.duration}</small></span>
            {l.videoUrl ? <a className="btn sm" href={l.videoUrl} target="_blank" rel="noreferrer">{t("detailWatch", "مشاهدة")}</a> : <span className="mut">{t("detailSoon", "قريبا")}</span>}</div>
        ))}
        <div className="row" style={{ marginTop: 12 }}>
          {enrollment ? (
            <Link className="btn gold" href="/student">الذهاب لبوابة الطالب</Link>
          ) : u && u.role !== "admin" ? (
            <button className="btn gold" id="enroll-btn" data-slug={c.slug}>
              {t("detailJoin", "التحق بالدورة")}
            </button>
          ) : (
            <Link className="btn gold" href="/admission">{t("detailJoin", "التحق بالدورة")}</Link>
          )}
          <Link className="btn ghost" href="/courses">{t("detailAll", "كل الدورات")}</Link>
        </div>
      </section>
      {(u && u.role !== "admin" && !enrollment) && (
        <script dangerouslySetInnerHTML={{ __html: `
          document.getElementById('enroll-btn')?.addEventListener('click', async function() {
            const slug = this.dataset.slug;
            this.disabled = true;
            this.textContent = 'جاري التسجيل...';
            try {
              const res = await fetch('/api/student/enroll', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ courseSlug: slug })
              });
              const data = await res.json();
              if (data.ok) {
                window.location.href = '/student';
              } else {
                alert(data.error || 'فشل التسجيل');
                this.disabled = false;
                this.textContent = 'التحق بالدورة';
              }
            } catch {
              alert('خطأ شبكة');
              this.disabled = false;
              this.textContent = 'التحق بالدورة';
            }
          });
        `}} />
      )}
    </>
  );
}