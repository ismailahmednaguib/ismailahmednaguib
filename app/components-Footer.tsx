// app/components-Footer.tsx : الفوتر فقط — كل البيانات من الإعدادات
export default function Footer({ siteName, tagline, contactEmail, contactPhone, footerAbout, footerRights }: { siteName: string; tagline: string; contactEmail: string; contactPhone: string; footerAbout: string; footerRights: string }) {
  return (
    <footer>
      <div className="fgrid">
        <div><h4>{siteName}</h4><p className="mut" style={{ color: "#b9c9c0" }}>{footerAbout || tagline}</p></div>
        <div><h4>أقسام</h4><a href="/courses">الدورات</a><a href="/library">المكتبة</a><a href="/quran">القرآن الكريم</a><a href="/verify">تحقق من شهادة</a></div>
        <div><h4>الطلاب</h4><a href="/admission">التقديم</a><a href="/login">دخول الإدارة</a><a href="/dashboard">لوحة التحكم</a></div>
        <div><h4>تواصل</h4><p style={{ fontSize: 13 }}>{contactEmail}<br />{contactPhone}</p></div>
      </div>
      <div className="copy">© 2026 {siteName} — {footerRights}</div>
    </footer>
  );
}
