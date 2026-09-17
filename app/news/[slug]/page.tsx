// app/news/[slug]/page.tsx : تفاصيل الخبر
import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "../../../lib/db";
import { getSiteSettings } from "../../../lib/site-settings";

export const dynamic = "force-dynamic";
export const dynamicParams = true;

export default async function NewsDetail({ params }: { params: { slug: string } }) {
  const news = await db.news();
  const n = news.find((x) => x.slug === params.slug);
  if (!n) return notFound();
  
  // التحقق من النشر
  const u = await (await import("../../../lib/auth")).currentUser();
  if (n.published === false && (!u || u.role !== "admin")) {
    return notFound();
  }
  
  const settings = await getSiteSettings().catch(() => null);
  const t = (k: string, fb: string) => (settings && (settings as Record<string, string>)[k]) || fb;
  
  return (
    <>
      <section className="page-head wrap"><h1>{n.title}</h1><p className="mut">{n.date}</p></section>
      <section className="wrap sec">
        <div className="card">
          <div className="pad">
            <p>{n.body}</p>
            <Link className="btn ghost" href="/news" style={{ marginTop: 12 }}>{t("detailAll", "كل الأخبار")}</Link>
          </div>
        </div>
      </section>
    </>
  );
}