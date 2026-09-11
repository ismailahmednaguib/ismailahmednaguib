// app/page.tsx : الرئيسية فقط — تجمع الأقسام الأربعة
import Link from "next/link";
import { SITE, TRACKS } from "../lib/site";
import { db } from "../lib/db";
import type { Course, Book, NewsItem } from "../lib/types";
import { CourseCard, BookCard } from "./components-Cards";

export const dynamic = "force-dynamic";

export default async function Home() {
  const courses: Course[] = (await db.courses()).slice(0, 4);
  const books: Book[] = (await db.books()).slice(0, 4);
  const news: NewsItem[] = (await db.news()).slice(0, 3);
  return (
    <>
      <section className="hero wrap">
        <div><span className="kicker">التقديم مفتوح 2026</span>
          <h1>{SITE.name}</h1>
          <p>{SITE.tagline} — منصة واحدة تجمع روح الجامعات والمعاهد: دورات، إجازات، تحفيظ، مهارات، وشهادات موثقة قابلة للتحقق.</p>
          <div className="row" style={{ marginTop: 14 }}>
            <Link className="btn gold" href="/admission">قدّم الآن</Link>
            <Link className="btn ghost" style={{ borderColor: "#fff", color: "#fff" }} href="/courses">تصفح الدورات</Link>
            <Link className="btn ghost" style={{ borderColor: "#fff", color: "#fff" }} href="/verify">تحقق من شهادة</Link>
          </div></div>
      </section>
      <section className="wrap stats">
        <div className="stat"><b>4</b><span>مسارات تعليمية</span></div>
        <div className="stat"><b>{courses.length}+</b><span>دورة</span></div>
        <div className="stat"><b>{books.length}+</b><span>كتاب</span></div>
        <div className="stat"><b>100%</b><span>عن بعد</span></div>
      </section>
      <section className="wrap sec"><div className="sec-h"><h2>المسارات الأربعة</h2></div>
        <div className="grid">{TRACKS.map((t) => (
          <div className="card" key={t.slug}><div className="thumb">{t.icon}</div>
            <div className="pad"><b>{t.title}</b><span className="mut">{t.desc}</span>
              <Link className="btn sm" href={`/courses?track=${t.slug}`}>ادخل المسار</Link></div></div>))}
        </div></section>
      <section className="wrap sec"><div className="sec-h"><h2>دورات مميزة</h2><Link href="/courses">الكل ←</Link></div>
        <div className="grid">{courses.map((c) => (<CourseCard key={c.slug} c={c} />))}</div></section>
      <section className="wrap sec"><div className="sec-h"><h2>من المكتبة</h2><Link href="/library">الكل ←</Link></div>
        <div className="grid">{books.map((b) => (<BookCard key={b.slug} b={b} />))}</div></section>
      <section className="wrap sec"><div className="sec-h"><h2>آخر الأخبار</h2><Link href="/news">الكل ←</Link></div>
        <div className="grid">{news.map((n) => (
          <div className="card" key={n.slug}><div className="pad"><b>{n.title}</b><span className="mut">{n.date}</span><span className="mut">{n.body}</span></div></div>))}
        </div></section>
    </>
  );
}

