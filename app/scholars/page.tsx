// app/scholars/page.tsx : العلماء فقط
import { db } from "../../lib/db";

export const dynamic = "force-dynamic";

export default async function Scholars() {
  const list = await db.scholars();
  return (<><section className="page-head wrap"><h1>العلماء والمشايخ</h1><p>هيئة التدريس والإشراف العلمي</p></section>
  <section className="wrap sec"><div className="grid">{list.map((s) => (
  <div className="card" key={s.slug}><div className="thumb">👳</div><div className="pad"><b>{s.name}</b><span className="badge">{s.title}</span><span className="mut">{s.bio}</span></div></div>))}</div></section></>);
}

