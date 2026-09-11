// app/dashboard/page.tsx : تجميع اللوحة فقط — كل قسم في ملف مستقل
import { redirect } from "next/navigation";
import { currentUser } from "../../lib/auth";
import { db } from "../../lib/db";
import type { DashboardRow } from "./ui";
import { Sec, Tbl } from "./ui";
import { FormCourse, FormLesson } from "./forms-1";
import { FormBook, FormScholar, FormNews, FormFatwa } from "./forms-2";
import { FormCert, FormSecurity } from "./forms-3";

export const dynamic = "force-dynamic";

export default async function Dashboard({ searchParams }: { searchParams?: { [key: string]: string | string[] | undefined } }) {
  const u = await currentUser();
  if (!u) redirect("/login");
  if (u.role !== "admin") redirect("/login");
  const courses: DashboardRow[] = (await db.courses()).map((x) => ({ ...x, __t: "courses" }));
  const lessons: DashboardRow[] = (await db.lessons()).map((x) => ({ ...x, __t: "lessons" }));
  const books: DashboardRow[] = (await db.books()).map((x) => ({ ...x, __t: "books" }));
  const scholars: DashboardRow[] = (await db.scholars()).map((x) => ({ ...x, __t: "scholars" }));
  const news: DashboardRow[] = (await db.news()).map((x) => ({ ...x, __t: "news" }));
  const fatwas: DashboardRow[] = (await db.fatwas()).map((x) => ({ ...x, __t: "fatwas" }));
  const certs: DashboardRow[] = (await db.certs()).map((x) => ({ ...x, __t: "certificates" }));
  const admissions: DashboardRow[] = (await db.admissions()).map((x) => ({ ...x, __t: "admissions" }));
  return (
    <div className="dash wrap">
      <aside className="side noprint">
        <a className="btn sm" href="/api/logout">خروج ({u.email})</a>
        <a href="#courses"><button style={{ width: "100%" }}>الدورات</button></a>
        <a href="#lessons"><button style={{ width: "100%" }}>الدروس</button></a>
        <a href="#books"><button style={{ width: "100%" }}>الكتب</button></a>
        <a href="#certs"><button style={{ width: "100%" }}>الشهادات</button></a>
        <a href="#admiss"><button style={{ width: "100%" }}>التقديمات</button></a>
        <a href="#security"><button style={{ width: "100%" }}>الأمان</button></a>
      </aside>
      <div>
        <section className="panel"><h2 style={{ margin: 0 }}>لوحة تحكم {u.email}</h2>
          <div className="kpis">
            <div className="kpi"><b>{courses.length}</b><span>دورة</span></div>
            <div className="kpi"><b>{lessons.length}</b><span>درس</span></div>
            <div className="kpi"><b>{books.length}</b><span>كتاب</span></div>
            <div className="kpi"><b>{certs.length}</b><span>شهادة</span></div>
            <div className="kpi"><b>{admissions.length}</b><span>طلب</span></div>
          </div></section>
        <FormCourse /><Tbl rows={courses} cols={["slug", "title", "track", "teacher", "price"]} />
        <FormLesson /><Tbl rows={lessons} cols={["courseSlug", "title", "duration"]} />
        <FormBook /><Tbl rows={books} cols={["slug", "title", "author"]} />
        <FormScholar /><Tbl rows={scholars} cols={["slug", "name", "title"]} />
        <FormNews /><Tbl rows={news} cols={["slug", "title", "date"]} />
        <FormFatwa /><Tbl rows={fatwas} cols={["q", "scholar"]} />
        <FormCert /><Tbl rows={certs} cols={["code", "student", "course", "grade"]} />
        <Sec id="admiss" title="طلبات التقديم"><Tbl rows={admissions} cols={["name", "phone", "track", "course", "status"]} /></Sec>
        <FormSecurity searchParams={searchParams} />
      </div>
    </div>
  );
}
