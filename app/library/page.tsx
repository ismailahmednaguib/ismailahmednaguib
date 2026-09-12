// app/library/page.tsx : المكتبة — كل النصوص من اللوحة
import { db } from "../../lib/db";
import { BookCard } from "../components-Cards";
import { getSiteSettings } from "../../lib/site-settings";

export const dynamic = "force-dynamic";

export default async function Library() {
  const books = await db.books();
  const s = await getSiteSettings().catch(() => null);
  return (
    <>
      <section className="page-head wrap"><h1>{s?.libraryTitle || "المكتبة"}</h1><p>{s?.libraryDesc || ""}</p></section>
      <section className="wrap sec">
        {books.length ? (<div className="grid">{books.map((b) => (<BookCard key={b.slug} b={b} />))}</div>)
        : (<p className="mut">{s?.emptyBooks || "لا توجد كتب بعد."}</p>)}
      </section>
    </>
  );
}


