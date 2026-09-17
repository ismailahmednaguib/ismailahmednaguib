// app/search/page.tsx : صفحة البحث الكاملة مع نتائج فعلية
import { getSiteSettings } from "@/lib/site-settings";
import SearchBox from "../components-Search";

export const dynamic = "force-dynamic";

export default async function SearchPage({ searchParams }: { searchParams?: { q?: string } }) {
  const s = await getSiteSettings().catch(() => null);
  const q = searchParams?.q || "";
  const t = (k: string, fb: string) => (s && (s as Record<string, string>)[k]) || fb;
  
  let results: any = null;
  if (q) {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/search?q=${encodeURIComponent(q)}`);
      if (res.ok) results = await res.json();
    } catch { /* ignore */ }
  }

  return (
    <>
      <section className="page-head wrap">
        <h1>🔍 {t("searchTitle", "البحث")}</h1>
        <p>{t("searchDesc", "ابحث في الدورات والكتب والأخبار والعلماء والفتاوى")}</p>
      </section>
      <section className="wrap sec">
        <SearchBox placeholder={t("searchPlaceholder", "اكتب للبحث...")} />
        {q && (
          <div id="search-page-results" className="search-page-results" style={{ marginTop: 20 }}>
            {results?.ok && results.results && results.results.length > 0 ? (
              <>
                <p className="mut" style={{ marginBottom: 16 }}>نتائج البحث عن: <b>{q}</b> — <b>{results.results.length}</b> نتيجة</p>
                {results.results.map((item: any, i: number) => (
                  <div key={i} className="panel" style={{ marginBottom: 12 }}>
                    <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                      <span className="badge">{item.type === "course" ? "🎓 دورة" : item.type === "book" ? "📚 كتاب" : item.type === "news" ? "📰 خبر" : item.type === "scholar" ? "👳 عالم" : item.type === "fatwa" ? "⚖️ فتوى" : "📄 محتوى"}</span>
                      <b>{item.title}</b>
                      {item.desc && <span className="mut" style={{ maxWidth: 400 }}>{item.desc}</span>}
                      <a className="btn sm" href={item.url}>عرض</a>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <p className="mut">لا توجد نتائج للبحث عن: <b>{q}</b></p>
            )}
          </div>
        )}
      </section>
    </>
  );
}