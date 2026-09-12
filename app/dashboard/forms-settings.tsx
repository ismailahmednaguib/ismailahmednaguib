// app/dashboard/forms-settings.tsx : كل نصوص الموقع من اللوحة — مقسمة مجموعات
import { Sec } from "./ui";
import type { SiteSettings } from "../../lib/site-settings";
import type { TrackSetting } from "../../lib/track-settings";

function Field({ name, label, value, long }: { name: string; label: string; value: string; long?: boolean }) {
  return (
    <div>
      <label>{label}</label>
      {long
        ? <textarea name={name} defaultValue={value} rows={2} />
        : <input name={name} defaultValue={value} maxLength={800} />}
    </div>
  );
}

export function FormSite({ settings, saved, tracks }: { settings: SiteSettings; saved: boolean; tracks: TrackSetting[] }) {
  return (
    <Sec id="site" title="إعدادات الموقع — كل كلمة في الموقع من هنا">
      {saved && (<div className="panel" style={{ borderColor: "var(--g2)" }}><b>✓ تم حفظ كل الإعدادات</b></div>)}
      <form className="frm" style={{ maxWidth: "100%" }} method="POST" action="/api/settings">
        <h4>الهوية والتواصل</h4>
        <div className="grid">
          <Field name="siteName" label="اسم المنصة" value={settings.siteName} />
          <Field name="tagline" label="السطر التعريفي" value={settings.tagline} />
          <Field name="announce" label="شريط الإعلان العلوي" value={settings.announce} />
          <Field name="contactEmail" label="بريد التواصل" value={settings.contactEmail} />
          <Field name="contactPhone" label="هاتف التواصل" value={settings.contactPhone} />
          <Field name="footerAbout" label="نبذة الفوتر" value={settings.footerAbout} long />
          <Field name="footerRights" label="سطر الحقوق" value={settings.footerRights} />
        </div>
        <h4>الواجهة الرئيسية</h4>
        <div className="grid">
          <Field name="heroKicker" label="شارة الواجهة" value={settings.heroKicker} />
          <Field name="heroTitle" label="عنوان الواجهة" value={settings.heroTitle} />
          <Field name="heroDesc" label="وصف الواجهة" value={settings.heroDesc} long />
        </div>
        <h4>عناوين الصفحات</h4>
        <div className="grid">
          <Field name="coursesTitle" label="عنوان الدورات" value={settings.coursesTitle} />
          <Field name="coursesDesc" label="وصف الدورات" value={settings.coursesDesc} />
          <Field name="libraryTitle" label="عنوان المكتبة" value={settings.libraryTitle} />
          <Field name="libraryDesc" label="وصف المكتبة" value={settings.libraryDesc} />
          <Field name="quranTitle" label="عنوان القرآنية" value={settings.quranTitle} />
          <Field name="quranDesc" label="وصف القرآنية" value={settings.quranDesc} />
          <Field name="scholarsTitle" label="عنوان العلماء" value={settings.scholarsTitle} />
          <Field name="scholarsDesc" label="وصف العلماء" value={settings.scholarsDesc} />
          <Field name="fatwaTitle" label="عنوان الفتاوى" value={settings.fatwaTitle} />
          <Field name="fatwaDesc" label="وصف الفتاوى" value={settings.fatwaDesc} />
          <Field name="newsTitle" label="عنوان الأخبار" value={settings.newsTitle} />
          <Field name="newsDesc" label="وصف الأخبار" value={settings.newsDesc} />
          <Field name="verifyTitle" label="عنوان التحقق" value={settings.verifyTitle} />
          <Field name="verifyDesc" label="وصف التحقق" value={settings.verifyDesc} />
          <Field name="admissionTitle" label="عنوان التقديم" value={settings.admissionTitle} />
          <Field name="admissionDesc" label="وصف التقديم" value={settings.admissionDesc} />
          <Field name="admissionOkTitle" label="عنوان نجاح التقديم" value={settings.admissionOkTitle} />
          <Field name="admissionOkDesc" label="وصف نجاح التقديم" value={settings.admissionOkDesc} />
          <Field name="emptyCourses" label="نص لا توجد دورات" value={settings.emptyCourses} />
          <Field name="emptyBooks" label="نص لا توجد كتب" value={settings.emptyBooks} />
          <Field name="emptyNews" label="نص لا توجد أخبار" value={settings.emptyNews} />
          <Field name="loginTitle" label="عنوان الدخول" value={settings.loginTitle} />
          <Field name="loginDesc" label="وصف الدخول" value={settings.loginDesc} />
        </div>
        <h4>نصوص الشهادة الرسمية</h4>
        <div className="grid">
          <Field name="certTitle" label="عنوان الشهادة" value={settings.certTitle} />
          <Field name="certSubtitle" label="سطر التشهد" value={settings.certSubtitle} />
          <Field name="certFooter" label="تذييل الشهادة" value={settings.certFooter} />
          <Field name="certSignName" label="اسم الموقع" value={settings.certSignName} />
          <Field name="certSignTitle" label="صفة الموقع" value={settings.certSignTitle} />
        </div>
        <h4>المسارات الأربعة</h4>
        <div className="grid">
          {tracks.map((t) => (
            <div key={t.slug} className="panel">
              <b>{t.slug}</b>
              <Field name={`track_${t.slug}_title`} label="العنوان" value={t.title} />
              <Field name={`track_${t.slug}_desc`} label="الوصف" value={t.desc} long />
            </div>
          ))}
        </div>
        <button className="btn gold big" type="submit">حفظ كل الإعدادات</button>
      </form>
    </Sec>
  );
}


