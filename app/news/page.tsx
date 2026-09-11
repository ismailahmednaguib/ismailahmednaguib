// app/news/page.tsx : الأخبار فقط
import { db } from "../../lib/db";

export const dynamic = "force-dynamic";

export default async function News() {
  const list = await db.news();
  return (<><section className="page-head wrap"><h1>الأخبار والإعلانات</h1><p>جديد المنصة والمسارات</p></section>
  <section className="wrap sec"><div className="grid">{list.map((n) => (
  <div className="card" key={n.slug}><div className="pad"><b>{n.title}</b><span className="mut">{n.date}</span><span className="mut">{n.body}</span></div></div>))}</div></section></>);
}

