// app/not-found.tsx : صفحة 404 مخصصة
import { getSiteSettings } from "@/lib/site-settings";
import Link from "next/link";

export default async function NotFound() {
  const s = await getSiteSettings().catch(() => null);
  const t = (k: string, fb: string) => (s && (s as Record<string, string>)[k]) || fb;
  return (
    <section className="wrap sec" style={{ textAlign: "center", padding: "60px 0" }}>
      <div style={{ fontSize: 64 }}>◈</div>
      <h1>{t("notFoundTitle", "الصفحة غير موجودة")}</h1>
      <p className="mut">{t("notFoundDesc", "الرابط الذي تحاول الوصول إليه غير موجود أو تم نقله.")}</p>
      <div className="row" style={{ justifyContent: "center", marginTop: 12 }}>
        <Link className="btn gold" href="/">{t("navHome", "الرئيسية")}</Link>
        <Link className="btn ghost" href="/courses">{t("navCourses", "تصفح الدورات")}</Link>
      </div>
    </section>
  );
}