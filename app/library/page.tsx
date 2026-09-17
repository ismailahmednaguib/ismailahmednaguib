// app/library/page.tsx : المكتبة — كل النصوص من اللوحة + ترقيم الصفحات
import { db } from "../../lib/db";
import { BookCard } from "../components-Cards";
import { getSiteSettings } from "../../lib/site-settings";

const PER_PAGE = 12;

export const dynamic = "force-dynamic";

export default async function Library({ searchParams }: { searchParams?: { [key: string]: string | string[] | undefined } }) {
  const all = await db.books();
  const s = await getSiteSettings().catch(() => null);
  const page = Math.max(1, Number(searchParams?.page) || 1);
  
  // تصفية المنشورة فقط وترتيب حسب order
  const published = all.filter((b) => b.published !== false);
  const sorted = published.sort((a, b) => (a.order || 0) - (b.order || 0));
  
  const totalPages = Math.ceil(sorted.length / PER_PAGE) || 1;
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * PER_PAGE;
  const paged = sorted.slice(start, start + PER_PAGE);
  const t = (k: string, fb: string) => (s && (s as Record<string, string>)[k]) || fb;
  const makeUrl = (p: number) => p > 1 ? `/library?page=${p}` : "/library";

  return (
    <>
      <section className="page-head wrap"><h1>{t("libraryTitle", "المكتبة")}</h1><p>{t("libraryDesc", "")}</p></section>
      <section className="wrap sec">
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