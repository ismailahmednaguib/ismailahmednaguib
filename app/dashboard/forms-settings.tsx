// app/dashboard/forms-settings.tsx : كل نصوص الموقع من اللوحة — يعرض كل المفاتيح تلقائيا
import { Sec } from "./ui";
import type { SiteSettings } from "../../lib/site-settings";
import { SITE_KEYS } from "../../lib/site-settings";
import type { TrackSetting } from "../../lib/track-settings";
import { AR, GROUPS } from "../../lib/settings-labels";

function Field({ name, label, value }: { name: string; label: string; value: string }) {
  const long = value.length > 90;
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
  const get = (k: string) => (settings as Record<string, string>)[k] || "";
  const known = new Set(GROUPS.flatMap((g) => g.keys));
  const extra = (SITE_KEYS as string[]).filter((k) => !known.has(k));
  return (
    <Sec id="site" title="إعدادات الموقع — كل كلمة في الموقع من هنا">
      {saved && (<div className="panel" style={{ borderColor: "var(--g2)" }}><b>✓ تم حفظ كل الإعدادات</b></div>)}
      <form className="frm" style={{ maxWidth: "100%" }} method="POST" action="/api/settings">
        {GROUPS.map((g) => (
          <div key={g.title}>
            <h4>{g.title}</h4>
            <div className="grid">
              {g.keys.map((k) => (<Field key={k} name={k} label={AR[k] || k} value={get(k)} />))}
            </div>
          </div>
        ))}
        {extra.length > 0 && (
          <div><h4>إضافية (مفاتيح جديدة تلقائيا)</h4><div className="grid">
            {extra.map((k) => (<Field key={k} name={k} label={AR[k] || k} value={get(k)} />))}
          </div></div>
        )}
        <h4>المسارات الأربعة</h4>
        <div className="grid">
          {tracks.map((x) => (
            <div key={x.slug} className="panel">
              <b>{x.slug}</b>
              <Field name={`track_${x.slug}_title`} label="العنوان" value={x.title} />
              <Field name={`track_${x.slug}_desc`} label="الوصف" value={x.desc} />
            </div>
          ))}
        </div>
        <button className="btn gold big" type="submit">حفظ كل الإعدادات</button>
      </form>
    </Sec>
  );
}



