// app/fatwa/page.tsx : الفتاوى — كل النصوص من اللوحة
import { db } from "../../lib/db";
import { getSiteSettings } from "../../lib/site-settings";

export const dynamic = "force-dynamic";

export default async function Fatwa() {
  const list = await db.fatwas();
  const s = await getSiteSettings().catch(() => null);
  return (<><section className="page-head wrap"><h1>{s?.fatwaTitle || "الفتاوى والاستشارات"}</h1><p>{s?.fatwaDesc || ""}</p></section>
  <section className="wrap sec">{list.length ? list.map((f) => (
  <div className="panel" key={f.id}><b>س: {f.q}</b><p>{f.a}</p><span className="mut">— {f.scholar}</span></div>))
  : (<p className="mut">لا توجد فتاوى بعد — أضف من لوحة التحكم.</p>)}</section></>);
}


