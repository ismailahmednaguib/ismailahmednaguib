// app/fatwa/page.tsx : الفتاوى فقط
import { db } from "../../lib/db";

export const dynamic = "force-dynamic";

export default async function Fatwa() {
  const list = await db.fatwas();
  return (<><section className="page-head wrap"><h1>الفتاوى والاستشارات</h1><p>إجابات موثقة من المشايخ</p></section>
  <section className="wrap sec">{list.map((f) => (
  <div className="panel" key={f.id}><b>س: {f.q}</b><p>{f.a}</p><span className="mut">— {f.scholar}</span></div>))}</section></>);
}

