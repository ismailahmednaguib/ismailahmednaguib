// app/fatwa/[id]/page.tsx : تفاصيل الفتوى
import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "../../../lib/db";
import { getSiteSettings } from "../../../lib/site-settings";

export const dynamic = "force-dynamic";
export const dynamicParams = true;

export default async function FatwaDetail({ params }: { params: { id: string } }) {
  const fatwas = await db.fatwas();
  const f = fatwas.find((x) => x.id === params.id);
  if (!f) return notFound();
  
  // التحقق من النشر
  const u = await (await import("../../../lib/auth")).currentUser();
  if (f.published === false && (!u || u.role !== "admin")) {
    return notFound();
  }
  
  const settings = await getSiteSettings().catch(() => null);
  const t = (k: string, fb: string) => (settings && (settings as Record<string, string>)[k]) || fb;
  
  return (
    <>
      <section className="page-head wrap"><h1>⚖️ {f.q}</h1></section>
      <section className="wrap sec">
        <div className="card">
          <div className="pad">
            <div style={{ marginBottom: 16, paddingBottom: 16, borderBottom: "1px solid var(--br)" }}>
              <p><b>السؤال:</b> {f.q}</p>
            </div>
            <div style={{ marginBottom: 16, paddingBottom: 16, borderBottom: "1px solid var(--br)" }}>
              <p><b>الجواب:</b> {f.a}</p>
            </div>
            {f.scholar && (
              <div className="mut"><b>الشيخ:</b> {f.scholar}</div>
            )}
            <Link className="btn ghost" href="/fatwa" style={{ marginTop: 16, display: "inline-block" }}>{t("detailAll", "كل الفتاوى")}</Link>
          </div>
        </div>
      </section>
    </>
  );
}