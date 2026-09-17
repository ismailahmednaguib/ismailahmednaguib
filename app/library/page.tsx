// app/library/page.tsx : المكتبة — كل النصوص من اللوحة + التصنيفات والوسوم + ترقيم الصفحات
import { db } from "../../lib/db";
import { BookCard } from "../components-Cards";
import { getSiteSettings } from "../../lib/site-settings";

const PER_PAGE = 12;

export const dynamic = "force-dynamic";

export default async function Library({ searchParams }: { searchParams?: { [key: string]: string | string[] | undefined } }) {
  const all = await db.books();
  const s = await getSiteSettings().catch(() => null);
  const cat = typeof searchParams?.category === "string" ? searchParams.category : undefined;
  const tag = typeof searchParams?.tag === "string" ? searchParams.tag : undefined;
  const page = Math.max(1, Number(searchParams?.page) || 1);
  
  // تصفية المنشورة فقط وترتيب حسب order
  const published = all.filter((b) => b.published !== false);
  const sorted = published.sort((a, b) => (a.order || 0) - (b.order || 0));
  
  // استخراج التصنيفات والوسوم الفريدة
  const categories = Array.from(new Set(sorted.flatMap(b => b.category ? [b.category] : []))).filter(Boolean);
  const allTags = Array.from(new Set(sorted.flatMap(b => b.tags || []))).filter(Boolean);
  
  let list = sorted;
  if (cat) list = list.filter((b) => b.category === cat);
  if (tag) list = list.filter((b) => b.tags?.includes(tag));
  
  const totalPages = Math.ceil(list.length / PER_PAGE) || 1;
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * PER_PAGE;
  const paged = list.slice(start, start + PER_PAGE);
  const t = (k: string, fb: string) => (s && (s as Record<string, string>)[k]) || fb;
  
  const makeUrl = (p: number, extraParams: Record<string, string> = {}) => {
    const params = new URLSearchParams();
    if (cat) params.set("category", cat);
    if (tag) params.set("tag", tag);
    if (p > 1) params.set("page", String(p));
    for (const [k, v] of Object.entries(extraParams)) params.set(k, v);
    const qs = params.toString();
    return `/library${qs ? `?${qs}` : ""}`;
  };

  return (
    <>
      <section className="page-head wrap"><h1>{t("libraryTitle", "المكتبة")}</h1><p>{t("libraryDesc", "")}</p></section>
      <section className="wrap sec">
        <div className="filters" style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
          {categories.length > 0 && categories.map((c) => (
            <a key={c} className="btn sm ghost" href={makeUrl(1, { category: c })}>📁 {c}</a>
          ))}
          {allTags.length > 0 && allTags.slice(0, 10).map((tg) => (
            <a key={tg} className="btn sm ghost" href={makeUrl(1, { tag: tg })}>🏷️ {tg}</a>
          ))}
        </div>
        {paged.length ? (
          <>
            <div className="grid">{paged.map((b) => (<BookCard key={b.slug} b={b} readLabel={t("libraryRead", "قراءة / تحميل")} />))}</div>
            {totalPages > 1 && (
              <nav className="pagination" aria-label="ترقيم صفحات المكتبة">
                {safePage > 1 && <a className="btn sm ghost" href={makeUrl(safePage - 1)}>السابق</a>}
                <span className="page-info" aria-current="page">صفحة {safePage} من {totalPages}</span>
                {safePage < totalPages && <a className="btn sm ghost" href={makeUrl(safePage + 1)}>التالي</a>}
              </nav>
            )}
          </>
        ) : (
          <p className="mut">{t("emptyBooks", "لا توجد كتب بعد.")}</p>
        )}
      </section>
    </>
  );
}