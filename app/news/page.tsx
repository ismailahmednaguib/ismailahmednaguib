// app/news/page.tsx : الأخبار — كل النصوص من اللوحة + ترقيم الصفحات
import { db } from "../../lib/db";
import { getSiteSettings } from "../../lib/site-settings";

const PER_PAGE = 10;

export const dynamic = "force-dynamic";

export default async function News({ searchParams }: { searchParams?: { [key: string]: string | string[] | undefined } }) {
  const all = await db.news();
  const s = await getSiteSettings().catch(() => null);
  const page = Math.max(1, Number(searchParams?.page) || 1);
  const totalPages = Math.ceil(all.length / PER_PAGE) || 1;
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * PER_PAGE;
  const paged = all.slice(start, start + PER_PAGE);
  const t = (k: string, fb: string) => (s && (s as Record<string, string>)[k]) || fb;
  const makeUrl = (p: number) => p > 1 ? `/news?page=${p}` : "/news";

  return (
    <>
      <section className="page-head wrap"><h1>{t("newsTitle", "الأخبار والإعلانات")}</h1><p>{t("newsDesc", "")}</p></section>
      <section className="wrap sec">
        {paged.length ? (
          <>
            <div className="grid">
              {paged.map((n) => (
                <div className="card" key={n.slug}><div className="pad"><b>{n.title}</b><span className="mut">{n.date}</span><span className="mut">{n.body}</span></div></div>
              ))}
            </div>
            {totalPages > 1 && (
              <nav className="pagination" aria-label="ترقيم صفحات الأخبار">
                {safePage > 1 && <a className="btn sm ghost" href={makeUrl(safePage - 1)}>السابق</a>}
                <span className="page-info" aria-current="page">صفحة {safePage} من {totalPages}</span>
                {safePage < totalPages && <a className="btn sm ghost" href={makeUrl(safePage + 1)}>التالي</a>}
              </nav>
            )}
          </>
        ) : (
          <p className="mut">{t("emptyNews", "لا توجد أخبار بعد.")}</p>
        )}
      </section>
    </>
  );
}