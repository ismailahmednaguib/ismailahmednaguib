// app/components-Footer.tsx : الفوتر فقط
import { SITE } from "../lib/site";
export default function Footer() {
  return (
    <footer>
      <div className="fgrid">
        <div><h4>{SITE.name}</h4><p className="mut" style={{ color: "#b9c9c0" }}>أكاديمية شرعية + معهد تدريبي + مدرسة قرآنية + أقسام جامعية مصغرة. تعلم عن بعد، إجازات مسندة، شهادات موثقة.</p></div>
        <div><h4>أقسام</h4><a href="/courses">الدورات</a><a href="/library">المكتبة</a><a href="/quran">القرآن الكريم</a><a href="/verify">تحقق من شهادة</a></div>
        <div><h4>الطلاب</h4><a href="/admission">التقديم</a><a href="/login">دخول الطلاب</a><a href="/dashboard">لوحة التحكم</a></div>
        <div><h4>تواصل</h4><p style={{ fontSize: 13 }}>{SITE.contact.email}<br />{SITE.contact.phone}</p></div>
      </div>
      <div className="copy">© 2026 {SITE.name} — جميع الحقوق محفوظة</div>
    </footer>
  );
}
