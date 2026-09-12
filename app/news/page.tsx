// app/news/page.tsx : الأخبار — كل النصوص من اللوحة
import { db } from "../../lib/db";
import { getSiteSettings } from "../../lib/site-settings";

export const dynamic = "force-dynamic";

export default async function News() {
  const list = await db.news();
  const s = await getSiteSettings().catch(() => null);
  return (<><section className="page-head wrap"><h1>{s?.newsTitle || "الأخبار والإعلانات"}</h1><p>{s?.newsDesc || ""}</p></section>
  <section className="wrap sec">{list.length ? (<div className="grid">{list.map((n) => (
  <div className="card" key={n.slug}><div className="pad"><b>{n.title}</b><span className="mut">{n.date}</span><span className="mut">{n.body}</span></div></div>))}</div>)
  : (<p className="mut">{s?.emptyNews || "لا توجد أخبار بعد."}</p>)}</section></>);
}


