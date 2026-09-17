// app/courses/page.tsx : صفحة الدورات — كل كلمة من اللوحة + فلترة حسب المسار + التصنيفات والوسوم + ترقيم الصفحات
import { db } from "../../lib/db";
import { CourseCard } from "../components-Cards";
import { getTracks } from "../../lib/track-settings";
import { getSiteSettings } from "../../lib/site-settings";

const PER_PAGE = 12;

export const dynamic = "force-dynamic";

export default async function Courses({ searchParams }: { searchParams?: { [key: string]: string | string[] | undefined } }) {
  const all = await db.courses();
  const s = await getSiteSettings().catch(() => null);
  const tracks = await getTracks().catch(() => []);
  const t = typeof searchParams?.track === "string" ? searchParams.track : undefined;
  const cat = typeof searchParams?.category === "string" ? searchParams.category : undefined;
  const tag = typeof searchParams?.tag === "string" ? searchParams.tag : undefined;
  const page = Math.max(1, Number(searchParams?.page) || 1);
  
  // تصفية المنشورة فقط وترتيب حسب order
  const published = all.filter((c) => c.published !== false);
  const sorted = published.sort((a, b) => (a.order || 0) - (b.order || 0));
  
  // استخراج التصنيفات والوسوم الفريدة
  const categories = Array.from(new Set(sorted.flatMap(c => c.category ? [c.category] : []))).filter(Boolean);
  const allTags = Array.from(new Set(sorted.flatMap(c => c.tags || []))).filter(Boolean);
  
  let list = t ? sorted.filter((c) => c.track === t) : sorted;
  if (cat) list = list.filter((c) => c.category === cat);
  if (tag) list = list.filter((c) => c.tags?.includes(tag));
  
  const totalPages = Math.ceil(list.length / PER_PAGE) || 1;
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * PER_PAGE;
  const paged = list.slice(start, start + PER_PAGE);
  const g = (k: string, fb: string) => (s && (s as Record<string, string>)[k]) || fb;
  
  const makeUrl = (p: number, extraParams: Record<string, string> = {}) => {
    const params = new URLSearchParams();
    if (t) params.set("track", t);
    if (cat) params.set("category", cat);
    if (tag) params.set("tag", tag);
    if (p > 1) params.set("page", String(p));
    for (const [k, v] of Object.entries(extraParams)) params.set(k, v);
    const qs = params.toString();
    return `/courses${qs ? `?${qs}` : ""}`;
  };

  return (
    <>
      <section className="page-head wrap"><h1>{g("coursesTitle", "الدورات والمسارات")}</h1><p>{g("coursesDesc", "")}</p></section>
      <section className="wrap sec">
        <div className="filters" style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
          <a className="btn sm" href="/courses">{g("coursesAll", "الكل")}</a>
          {tracks.map((tt) => (<a key={tt.slug} className="btn sm ghost" href={`/courses?track=${tt.slug}`}>{tt.icon} {tt.title}</a>))}
          {categories.length > 0 && categories.map((c) => (
            <a key={c} className="btn sm ghost" href={makeUrl(1, { category: c })}>📁 {c}</a>
          ))}
          {allTags.length > 0 && allTags.slice(0, 10).map((tg) => (
            <a key={tg} className="btn sm ghost" href={makeUrl(1, { tag: tg })}>🏷️ {tg}</a>
          ))}
        </div>
        {paged.length ? (
          <>
            <div className="grid">{paged.map((c) => (<CourseCard key={c.slug} c={c} />))}</div>
            {totalPages > 1 && (
              <nav className="pagination" aria-label="ترقيم صفحات الدورات">
                {safePage > 1 && <a className="btn sm ghost" href={makeUrl(safePage - 1)}>السابق</a>}
                <span className="page-info" aria-current="page">صفحة {safePage} من {totalPages}</span>
                {safePage < totalPages && <a className="btn sm ghost" href={makeUrl(safePage + 1)}>التالي</a>}
              </nav>
            )}
          </>
        ) : (
          <p className="mut">{g("emptyCourses", "لا توجد دورات بعد.")}</p>
        )}
      </section>
    </>
  );
}