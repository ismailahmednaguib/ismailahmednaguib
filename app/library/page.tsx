// app/library/page.tsx : المكتبة فقط — كتب PDF
import { db } from "../../lib/db";
import { BookCard } from "../components-Cards";

export const dynamic = "force-dynamic";

export default async function Library() {
  const books = await db.books();
  return (
    <>
      <section className="page-head wrap"><h1>المكتبة</h1><p>كتب ومتون PDF للتحميل والقراءة — تضاف من لوحة التحكم</p></section>
      <section className="wrap sec"><div className="grid">{books.map((b) => (<BookCard key={b.slug} b={b} />))}</div></section>
    </>
  );
}

