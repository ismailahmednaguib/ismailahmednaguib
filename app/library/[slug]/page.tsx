// app/library/[slug]/page.tsx : تفاصيل الكتاب
import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "../../../lib/db";
import { getSiteSettings } from "../../../lib/site-settings";

export const dynamic = "force-dynamic";
export const dynamicParams = true;

export default async function BookDetail({ params }: { params: { slug: string } }) {
  const books = await db.books();
  const b = books.find((x) => x.slug === params.slug);
  if (!b) return notFound();
  
  // التحقق من النشر
  const u = await (await import("../../../lib/auth")).currentUser();
  if (b.published === false && (!u || u.role !== "admin")) {
    return notFound();
  }
  
  const s = await getSiteSettings().catch(() => null);
  const t = (k: string, fb: string) => (s && (s as Record<string, string>)[k]) || fb;
  
  return (
    <>
      <section className="page-head wrap"><span className="kicker">{b.track}</span><h1>{b.title}</h1><p>{b.author} • {b.pages} صفحة</p></section>
      <section className="wrap sec">
        {b.pdfUrl && (
          <div className="row" style={{ marginBottom: 16 }}>
            <a className="btn gold" href={b.pdfUrl} target="_blank" rel="noreferrer">{t("libraryRead", "قراءة / تحميل")}</a>
            <Link className="btn ghost" href="/library">{t("detailAll", "كل الكتب")}</Link>
          </div>
        )}
        <p>{b.desc}</p>
      </section>
    </>
  );
}