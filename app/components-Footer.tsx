// app/components-Footer.tsx : الفوتر — كل كلمة من اللوحة
import Link from "next/link";
import type { SiteSettings } from "../lib/site-settings";
export default function Footer({ s }: { s: SiteSettings }) {
  return (
    <footer>
      <div className="fgrid">
        <div><h4>{s.siteName}</h4><p className="mut" style={{ color: "#b9c9c0" }}>{s.footerAbout || s.tagline}</p></div>
        <div><h4>{s.footerSec1 || "أقسام"}</h4><Link href="/courses">{s.navCourses || "الدورات"}</Link><Link href="/library">{s.navLibrary || "المكتبة"}</Link><Link href="/quran">{s.navQuran || "القرآن الكريم"}</Link><Link href="/verify">{s.navVerify || "تحقق من شهادة"}</Link></div>
        <div><h4>{s.footerSec2 || "الطلاب"}</h4><Link href="/admission">{s.navAdmission || "التقديم"}</Link><Link href="/login">{s.loginTitle || "دخول الإدارة"}</Link><Link href="/dashboard">{s.navDashboard || "لوحة التحكم"}</Link></div>
        <div><h4>{s.footerSec3 || "تواصل"}</h4><p style={{ fontSize: 13 }}>{s.contactEmail}<br />{s.contactPhone}</p></div>
      </div>
      <div className="copy">© 2026 {s.siteName} — {s.footerRights}</div>
    </footer>
  );
}
