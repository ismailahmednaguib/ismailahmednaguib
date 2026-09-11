// app/dashboard/forms-settings.tsx : إعدادات الموقع من اللوحة — الاسم والتواصل والإعلان والواجهة
import { Sec } from "./ui";
import type { SiteSettings } from "../../lib/site-settings";

export function FormSite({ settings, saved }: { settings: SiteSettings; saved: boolean }) {
  return (
    <Sec id="site" title="إعدادات الموقع — الاسم والتواصل والواجهة">
      {saved && (<div className="panel" style={{ borderColor: "var(--g2)" }}><b>✓ تم حفظ إعدادات الموقع</b></div>)}
      <form className="frm" method="POST" action="/api/settings">
        <label>اسم المنصة</label>
        <input name="siteName" defaultValue={settings.siteName} required maxLength={80} />
        <label>السطر التعريفي</label>
        <input name="tagline" defaultValue={settings.tagline} maxLength={200} />
        <label>شريط الإعلان العلوي</label>
        <input name="announce" defaultValue={settings.announce} maxLength={200} />
        <div className="row">
          <div style={{ flex: 1 }}><label>بريد التواصل</label><input name="contactEmail" defaultValue={settings.contactEmail} dir="ltr" /></div>
          <div style={{ flex: 1 }}><label>هاتف التواصل</label><input name="contactPhone" defaultValue={settings.contactPhone} dir="ltr" /></div>
        </div>
        <label>عنوان الواجهة الرئيسي</label>
        <input name="heroTitle" defaultValue={settings.heroTitle} maxLength={120} />
        <label>شارة الواجهة</label>
        <input name="heroKicker" defaultValue={settings.heroKicker} maxLength={120} />
        <label>وصف الواجهة</label>
        <textarea name="heroDesc" defaultValue={settings.heroDesc} />
        <button className="btn gold" type="submit">حفظ الإعدادات</button>
      </form>
    </Sec>
  );
}
