// app/courses/page.tsx : صفحة الدورات فقط — فلترة حسب المسار
import { db } from "../../lib/db";
import { CourseCard } from "../components-Cards";
import { TRACKS } from "../../lib/site";

export default async function Courses({ searchParams }: { searchParams?: { [key: string]: string | string[] | undefined } }) {
  const all = await db.courses();
  const t = typeof searchParams?.track === "string" ? searchParams.track : undefined;
  const list = t ? all.filter((c) => c.track === t) : all;
  return (
    <>
      <section className="page-head wrap"><h1>الدورات والمسارات</h1><p>اختر مسارك: شرعي • تدريبي • قرآني • جامعي مصغر</p></section>
      <section className="wrap sec">
        <div className="filters">
          <a className="btn sm" href="/courses">الكل</a>
          {TRACKS.map((tt) => (<a key={tt.slug} className="btn sm ghost" href={`/courses?track=${tt.slug}`}>{tt.icon} {tt.title}</a>))}
        </div>
        <div className="grid">{list.map((c) => (<CourseCard key={c.slug} c={c} />))}</div>
      </section>
    </>
  );
}

