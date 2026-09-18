// app/[locale]/page.tsx : الصفحة الرئيسية متعددة اللغات
import Link from "next/link";
import { getTracks } from "@/lib/track-settings";
import { getSiteSettings } from "@/lib/site-settings";
import { db } from "@/lib/db";
import type { Course, Book, NewsItem } from "@/lib/types";
import { CourseCard, BookCard } from "@/app/components-Cards";

export const dynamic = "force-dynamic";

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const messages = (await import(`@/messages/${locale}.json`)).default;
  const t = (key: string, fallback: string) => {
    const value = key.split(".").reduce<unknown>((current, part) => (
      current && typeof current === "object" ? (current as Record<string, unknown>)[part] : undefined
    ), messages);
    return typeof value === "string" && value ? value : fallback;
  };

  const settings = await getSiteSettings().catch(() => null);
  const tracks = await getTracks().catch(() => []);
  const allCourses: Course[] = await db.courses();
  const allBooks: Book[] = await db.books();
  const allNews: NewsItem[] = await db.news();
  const courses = allCourses.filter((item) => item.published !== false).sort((a, b) => (a.order || 0) - (b.order || 0)).slice(0, 4);
  const books = allBooks.filter((item) => item.published !== false).sort((a, b) => (a.order || 0) - (b.order || 0)).slice(0, 4);
  const news = allNews.filter((item) => item.published !== false).sort((a, b) => (a.order || 0) - (b.order || 0)).slice(0, 3);
  const settingText = (key: string, fallback: string) => (settings && (settings as Record<string, string>)[key]) || fallback;

  return (
    <>
      <section className="hero wrap">
        <div>
          <span className="kicker">{settingText("heroKicker", t("heroKicker", "التقديم مفتوح"))}</span>
          <h1>{settingText("heroTitle", t("heroTitle", "منصتنا التعليمية"))}</h1>
          <p>{settingText("heroDesc", t("heroDesc", "دورات، إجازات، تحفيظ، مهارات، وشهادات موثقة قابلة للتحقق."))}</p>
          <div className="row" style={{ marginTop: 14 }}>
            <Link className="btn gold" href={`/${locale}/admission`}>{t("heroBtn1", "قدّم الآن")}</Link>
            <Link className="btn ghost" style={{ borderColor: "#fff", color: "#fff" }} href={`/${locale}/courses`}>{t("heroBtn2", "تصفح الدورات")}</Link>
            <Link className="btn ghost" style={{ borderColor: "#fff", color: "#fff" }} href={`/${locale}/verify`}>{t("heroBtn3", "تحقق من شهادة")}</Link>
          </div>
        </div>
      </section>
      <section className="wrap stats">
        <div className="stat"><b>{t("statTracksNum", "4")}</b><span>{t("statTracksLabel", "مسارات تعليمية")}</span></div>
        <div className="stat"><b>{courses.length}+</b><span>{t("statCoursesLabel", "دورة")}</span></div>
        <div className="stat"><b>{books.length}+</b><span>{t("statBooksLabel", "كتاب")}</span></div>
        <div className="stat"><b>{t("statOnlineNum", "100%")}</b><span>{t("statOnlineLabel", "عن بعد")}</span></div>
      </section>
      <section className="wrap sec">
        <div className="sec-h"><h2>{t("homeTracksTitle", "المسارات الأربعة")}</h2></div>
        <div className="grid">{tracks.map((track) => (
          <div className="card" key={track.slug}>
            <div className="thumb">{track.icon}</div>
            <div className="pad"><b>{track.title}</b><span className="mut">{track.desc}</span><Link className="btn sm" href={`/${locale}/courses?track=${track.slug}`}>{t("homeTrackBtn", "ادخل المسار")}</Link></div>
          </div>
        ))}</div>
      </section>
      <section className="wrap sec">
        <div className="sec-h"><h2>{t("homeFeaturedTitle", "دورات مميزة")}</h2><Link href={`/${locale}/courses`}>{t("homeAllLink", "الكل ←")}</Link></div>
        {courses.length ? <div className="grid">{courses.map((course) => <CourseCard key={course.slug} c={course} locale={locale} />)}</div> : <p className="mut">{t("emptyCourses", "لا توجد دورات بعد.")}</p>}
      </section>
      <section className="wrap sec">
        <div className="sec-h"><h2>{t("homeBooksTitle", "من المكتبة")}</h2><Link href={`/${locale}/library`}>{t("homeAllLink", "الكل ←")}</Link></div>
        {books.length ? <div className="grid">{books.map((book) => <BookCard key={book.slug} b={book} locale={locale} />)}</div> : <p className="mut">{t("emptyBooks", "لا توجد كتب بعد.")}</p>}
      </section>
      <section className="wrap sec">
        <div className="sec-h"><h2>{t("homeNewsTitle", "آخر الأخبار")}</h2><Link href={`/${locale}/news`}>{t("homeAllLink", "الكل ←")}</Link></div>
        {news.length ? <div className="grid">{news.map((item) => <div className="card" key={item.slug}><div className="pad"><b>{item.title}</b><span className="mut">{item.date}</span><span className="mut">{item.body}</span></div></div>)}</div> : <p className="mut">{t("emptyNews", "لا توجد أخبار بعد.")}</p>}
      </section>
    </>
  );
}
