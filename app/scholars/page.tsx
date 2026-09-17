// app/scholars/page.tsx : العلماء — كل النصوص من اللوحة
import { db } from "../../lib/db";
import { getSiteSettings } from "../../lib/site-settings";

export const dynamic = "force-dynamic";

export default async function Scholars() {
  const all = await db.scholars();
  const s = await getSiteSettings().catch(() => null);
  
  // تصفية المنشورة فقط وترتيب حسب order
  const published = all.filter((x) => x.published !== false);
  const list = published.sort((a, b) => (a.order || 0) - (b.order || 0));
  
  return (<><section className="page-head wrap"><h1>{s?.scholarsTitle || "العلماء والمشايخ"}</h1><p>{s?.scholarsDesc || ""}</p></section>
  <section className="wrap sec">{list.length ? (<div className="grid">{list.map((x) => (
  <div className="card" key={x.slug}><div className="thumb">👳</div><div className="pad"><b>{x.name}</b><span className="badge">{x.title}</span><span className="mut">{x.bio}</span></div></div>))}</div>)
  : (<p className="mut">لا توجد بيانات بعد — أضف من لوحة التحكم.</p>)}</section></>);
}


