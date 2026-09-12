// app/courses/page.tsx : صفحة الدورات — كل النصوص من اللوحة + فلترة حسب المسار
import { db } from "../../lib/db";
import { CourseCard } from "../components-Cards";
import { getTracks } from "../../lib/track-settings";
import { getSiteSettings } from "../../lib/site-settings";

export const dynamic = "force-dynamic";

export default async function Courses({ searchParams }: { searchParams?: { [key: string]: string | string[] | undefined } }) {
  const all = await db.courses();
  const s = await getSiteSettings().catch(() => null);
  const tracks = await getTracks().catch(() => []);
  const t = typeof searchParams?.track === "string" ? searchParams.track : undefined;
  const list = t ? all.filter((c) => c.track === t) : all;
  return (
    <>
      <section className="page-head wrap"><h1>{s?.coursesTitle || "الدورات والمسارات"}</h1><p>{s?.coursesDesc || ""}</p></section>
      <section className="wrap sec">
        <div className="filters">
          <a className="btn sm" href="/courses">الكل</a>
          {tracks.map((tt) => (<a key={tt.slug} className="btn sm ghost" href={`/courses?track=${tt.slug}`}>{tt.icon} {tt.title}</a>))}
        </div>
        {list.length ? (<div className="grid">{list.map((c) => (<CourseCard key={c.slug} c={c} />))}</div>)
        : (<p className="mut">{s?.emptyCourses || "لا توجد دورات بعد."}</p>)}
      </section>
    </>
  );
}


