// app/scholars/[slug]/page.tsx : تفاصيل العالم
import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "../../../lib/db";
import { getSiteSettings } from "../../../lib/site-settings";

export const dynamic = "force-dynamic";
export const dynamicParams = true;

export default async function ScholarDetail({ params }: { params: { slug: string } }) {
  const scholars = await db.scholars();
  const s = scholars.find((x) => x.slug === params.slug);
  if (!s) return notFound();
  
  // التحقق من النشر
  const u = await (await import("../../../lib/auth")).currentUser();
  if (s.published === false && (!u || u.role !== "admin")) {
    return notFound();
  }
  
  const settings = await getSiteSettings().catch(() => null);
  const t = (k: string, fb: string) => (settings && (settings as Record<string, string>)[k]) || fb;
  
  return (
    <>
      <section className="page-head wrap"><h1>{s.name}</h1><p className="mut">{s.title}</p></section>
      <section className="wrap sec">
        <div className="card">
          <div className="pad">
            <p>{s.bio}</p>
            <Link className="btn ghost" href="/scholars" style={{ marginTop: 12 }}>{t("detailAll", "كل العلماء")}</Link>
          </div>
        </div>
      </section>
    </>
  );
}