// app/page.tsx : الرئيسية — كل كلمة من اللوحة
import Link from "next/link";
import { getTracks } from "../lib/track-settings";
import { getSiteSettings } from "../lib/site-settings";
import { db } from "../lib/db";
import type { Course, Book, NewsItem } from "../lib/types";
import { CourseCard, BookCard } from "./components-Cards";

export const dynamic = "force-dynamic";

export default async function Home() {
  const s = await getSiteSettings().catch(() => null);
  const tracks = await getTracks().catch(() => []);
  
  // جلب البيانات وتصفيتها وترتيبها
  const allCourses: Course[] = await db.courses();
  const allBooks: Book[] = await db.books();
  const allNews: NewsItem[] = await db.news();
  
  const courses = allCourses
    .filter((c) => c.published !== false)
    .sort((a, b) => (a.order || 0) - (b.order || 0))
    .slice(0, 4);
  
  const books = allBooks
    .filter((b) => b.published !== false)
    .sort((a, b) => (a.order || 0) - (b.order || 0))
    .slice(0, 4);
  
  const news = allNews
    .filter((n) => n.published !== false)
    .sort((a, b) => (a.order || 0) - (b.order || 0))
    .slice(0, 3);
  
  const t = (k: string, fb: string) => (s && (s as Record<string, string>)[k]) || fb;
  return (
    <>
      <section className="hero wrap">
        <div><span className="kicker">{t("heroKicker", "التقديم مفتوح")}</span>
          <h1>{t("heroTitle", "منصتنا التعليمية")}</h1>
          <p>{t("heroDesc", "دورات، إجازات، تحفيظ، مهارات، وشهادات موثقة قابلة للتحقق.")}</p>
          <div className="row" style={{ marginTop: 14 }}>
            <Link className="btn gold" href="/admission">{t("heroBtn1", "قدّم الآن")}</Link>
            <Link className="btn ghost" style={{ borderColor: "#fff", color: "#fff" }} href="/courses">{t("heroBtn2", "تصفح الدورات")}</Link>
            <Link className="btn ghost" style={{ borderColor: "#fff", color: "#fff" }} href="/verify">{t("heroBtn3", "تحقق من شهادة")}</Link>
          </div></div>
      </section>
      <section className="wrap stats">
        <div className="stat"><b>{t("statTracksNum", "4")}</b><span>{t("statTracksLabel", "مسارات تعليمية")}</span></div>
        <div className="stat"><b>{courses.length}+</b><span>{t("statCoursesLabel", "دورة")}</span></div>
        <div className="stat"><b>{books.length}+</b><span>{t("statBooksLabel", "كتاب")}</span></div>
        <div className="stat"><b>{t("statOnlineNum", "100%")}</b><span>{t("statOnlineLabel", "عن بعد")}</span></div>
      </section>
      <section className="wrap sec"><div className="sec-h"><h2>{t("homeTracksTitle", "المسارات الأربعة")}</h2></div>
        <div className="grid">{tracks.map((x) => (
          <div className="card" key={x.slug}><div className="thumb">{x.icon}</div>
            <div className="pad"><b>{x.title}</b><span className="mut">{x.desc}</span>
              <Link className="btn sm" href={`/courses?track=${x.slug}`}>{t("homeTrackBtn", "ادخل المسار")}</Link></div></div>))}
        </div></section>
      <section className="wrap sec"><div className="sec-h"><h2>{t("homeFeaturedTitle", "دورات مميزة")}</h2><Link href="/courses">{t("homeAllLink", "الكل ←")}</Link></div>
        {courses.length ? (<div className="grid">{courses.map((c) => (<CourseCard key={c.slug} c={c} />))}</div>)
        : (<p className="mut">{t("emptyCourses", "لا توجد دورات بعد.")}</p>)}</section>
      <section className="wrap sec"><div className="sec-h"><h2>{t("homeBooksTitle", "من المكتبة")}</h2><Link href="/library">{t("homeAllLink", "الكل ←")}</Link></div>
        {books.length ? (<div className="grid">{books.map((b) => (<BookCard key={b.slug} b={b} />))}</div>)
        : (<p className="mut">{t("emptyBooks", "لا توجد كتب بعد.")}</p>)}</section>
      <section className="wrap sec"><div className="sec-h"><h2>{t("homeNewsTitle", "آخر الأخبار")}</h2><Link href="/news">{t("homeAllLink", "الكل ←")}</Link></div>
        {news.length ? (<div className="grid">{news.map((n) => (
          <div className="card" key={n.slug}><div className="pad"><b>{n.title}</b><span className="mut">{n.date}</span><span className="mut">{n.body}</span></div></div>))}
        </div>) : (<p className="mut">{t("emptyNews", "لا توجد أخبار بعد.")}</p>)}
      </section>
    </>
  );
}



