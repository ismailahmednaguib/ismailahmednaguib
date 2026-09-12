// app/dashboard/page.tsx : تجميع اللوحة — كل قسم في ملف مستقل + إعدادات الموقع + قبول/رفض التقديمات
import { redirect } from "next/navigation";
import { currentUser } from "../../lib/auth";
import { db } from "../../lib/db";
import { getSiteSettings } from "../../lib/site-settings";
import { getTracks } from "../../lib/track-settings";
import type { DashboardRow } from "./ui";
import { Sec, Tbl } from "./ui";
import { FormCourse, FormLesson } from "./forms-1";
import { FormBook, FormScholar, FormNews, FormFatwa } from "./forms-2";
import { FormCert, FormSecurity } from "./forms-3";
import { FormSite } from "./forms-settings";
import AdmissActions from "./AdmissActions";

export const dynamic = "force-dynamic";

export default async function Dashboard({ searchParams }: { searchParams?: { [key: string]: string | string[] | undefined } }) {
  const u = await currentUser();
  if (!u) redirect("/login");
  if (u.role !== "admin") redirect("/login");
  const mode = db.storageMode();
  const settings = await getSiteSettings().catch(() => null);
  const tracks = await getTracks().catch(() => []);
  const saved = searchParams?.settings === "ok";
  const lastCode = typeof searchParams?.cert === "string" ? searchParams.cert : undefined;
  const courses: DashboardRow[] = (await db.courses()).map((x) => ({ ...x, __t: "courses" }));
  const lessons: DashboardRow[] = (await db.lessons()).map((x) => ({ ...x, __t: "lessons" }));
  const books: DashboardRow[] = (await db.books()).map((x) => ({ ...x, __t: "books" }));
  const scholars: DashboardRow[] = (await db.scholars()).map((x) => ({ ...x, __t: "scholars" }));
  const news: DashboardRow[] = (await db.news()).map((x) => ({ ...x, __t: "news" }));
  const fatwas: DashboardRow[] = (await db.fatwas()).map((x) => ({ ...x, __t: "fatwas" }));
  const certs: DashboardRow[] = (await db.certs()).map((x) => ({ ...x, __t: "certificates" }));
  const admissions: DashboardRow[] = (await db.admissions()).map((x) => ({ ...x, __t: "admissions" }));
  const fallbackSettings = {
    siteName: "منصتنا التعليمية", tagline: "", announce: "التقديم مفتوح",
    contactEmail: "", contactPhone: "", heroKicker: "التقديم مفتوح",
    heroTitle: "منصتنا التعليمية", heroDesc: "", footerAbout: "", footerRights: "",
    coursesTitle: "الدورات", coursesDesc: "", libraryTitle: "المكتبة", libraryDesc: "",
    quranTitle: "المدرسة القرآنية", quranDesc: "", scholarsTitle: "العلماء", scholarsDesc: "",
    fatwaTitle: "الفتاوى", fatwaDesc: "", newsTitle: "الأخبار", newsDesc: "",
    verifyTitle: "التحقق", verifyDesc: "", admissionTitle: "التقديم", admissionDesc: "",
    admissionOkTitle: "", admissionOkDesc: "", emptyCourses: "", emptyBooks: "", emptyNews: "",
    certTitle: "شهادة إتمام", certSubtitle: "", certFooter: "", certSignName: "", certSignTitle: "",
    loginTitle: "دخول الإدارة", loginDesc: "",
  };
  return (
    <div className="dash wrap">
      <aside className="side noprint">
        <a className="btn sm" href="/api/logout">خروج ({u.email})</a>
        <a href="#site"><button style={{ width: "100%" }}>إعدادات الموقع</button></a>
        <a href="#courses"><button style={{ width: "100%" }}>الدورات</button></a>
        <a href="#lessons"><button style={{ width: "100%" }}>الدروس</button></a>
        <a href="#books"><button style={{ width: "100%" }}>الكتب</button></a>
        <a href="#scholars"><button style={{ width: "100%" }}>العلماء</button></a>
        <a href="#news"><button style={{ width: "100%" }}>الأخبار</button></a>
        <a href="#fatwa"><button style={{ width: "100%" }}>الفتاوى</button></a>
        <a href="#certs"><button style={{ width: "100%" }}>الشهادات</button></a>
        <a href="#admiss"><button style={{ width: "100%" }}>التقديمات</button></a>
        <a href="#security"><button style={{ width: "100%" }}>الأمان</button></a>
      </aside>
      <div>
        <section className="panel"><h2 style={{ margin: 0 }}>لوحة التحكم</h2>
          <p className="mut">مرحبا {u.email} — من هنا تتحكم في كل حاجة: الموقع والدورات والدروس والكتب والعلماء والأخبار والفتاوى والشهادات والتقديمات والأمان.</p>
          <p className="mut">حالة الحفظ: {mode === "supabase" ? "☁️ حفظ سحابي دائم مفعّل ✓" : "💾 حفظ محلي"}</p>
          <div className="kpis">
            <div className="kpi"><b>{courses.length}</b><span>دورة</span></div>
            <div className="kpi"><b>{lessons.length}</b><span>درس</span></div>
            <div className="kpi"><b>{books.length}</b><span>كتاب</span></div>
            <div className="kpi"><b>{certs.length}</b><span>شهادة</span></div>
            <div className="kpi"><b>{admissions.length}</b><span>طلب</span></div>
          </div></section>
        <FormSite settings={(settings || fallbackSettings) as never} saved={saved} tracks={tracks} />
        <FormCourse /><Tbl rows={courses} cols={["slug", "title", "track", "teacher", "price"]} />
        <FormLesson /><Tbl rows={lessons} cols={["courseSlug", "title", "duration"]} />
        <FormBook /><Tbl rows={books} cols={["slug", "title", "author"]} />
        <FormScholar /><Tbl rows={scholars} cols={["slug", "name", "title"]} />
        <FormNews /><Tbl rows={news} cols={["slug", "title", "date"]} />
        <FormFatwa /><Tbl rows={fatwas} cols={["q", "scholar"]} />
        <FormCert lastCode={lastCode} /><Tbl rows={certs} cols={["code", "student", "course", "grade"]} />
        <Sec id="admiss" title="طلبات التقديم — قبول / رفض / حذف">
          {admissions.length ? (
            <div style={{ overflowX: "auto" }}><table className="tbl"><thead><tr>
              <th>الاسم</th><th>الهاتف</th><th>المسار</th><th>الدورة</th><th>الحالة والتحكم</th>
            </tr></thead><tbody>
              {admissions.map((r) => {
                const rid = String(r.id || "");
                const st = String(r.status || "new");
                return (
                  <tr key={rid || String(r.phone)}>
                    <td>{String(r.name || "")}</td><td dir="ltr">{String(r.phone || "")}</td>
                    <td>{String(r.track || "")}</td><td>{String(r.course || "")}</td>
                    <td><AdmissActions rowId={rid} status={st} /></td>
                  </tr>
                );
              })}
            </tbody></table></div>
          ) : (<p className="mut">لا توجد طلبات بعد.</p>)}
        </Sec>
        <FormSecurity searchParams={searchParams} />
      </div>
    </div>
  );
}

