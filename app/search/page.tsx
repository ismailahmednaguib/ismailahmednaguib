// app/search/page.tsx : صفحة البحث الكاملة
import { getSiteSettings } from "../lib/site-settings";
import SearchBox from "../components-Search";

export const dynamic = "force-dynamic";

export default async function SearchPage({ searchParams }: { searchParams?: { q?: string } }) {
  const s = await getSiteSettings().catch(() => null);
  const q = searchParams?.q || "";
  return (
    <>
      <section className="page-head wrap">
        <h1>🔍 البحث</h1>
        <p>ابحث في الدورات والكتب والأخبار والعلماء والفتاوى</p>
      </section>
      <section className="wrap sec">
        <SearchBox placeholder="اكتب للبحث..." />
        {q && (
          <div id="search-page-results" className="search-page-results">
            <p className="mut">جاري البحث عن: <b>{q}</b></p>
          </div>
        )}
      </section>
    </>
  );
}