// app/contact/page.tsx : صفحة التواصل — كل النصوص من اللوحة
import { getSiteSettings } from "@/lib/site-settings";

export const dynamic = "force-dynamic";

interface Props {
  searchParams?: { [key: string]: string | string[] | undefined };
}

export default async function Contact({ searchParams }: Props) {
  const s = await getSiteSettings().catch(() => null);
  const ok = searchParams?.ok === "1";
  const t = (k: string, fb: string) => (s && (s as Record<string, string>)[k]) || fb;

  return (
    <>
      <section className="page-head wrap"><h1>{t("contactTitle", "تواصل معنا")}</h1><p>{t("contactDesc", "")}</p></section>
      <section className="wrap sec">
        {ok && (<div className="panel" style={{ borderColor: "var(--g2)" }}><b>✓ {t("contactOkTitle", "تم إرسال رسالتك بنجاح")}</b><p className="mut">{t("contactOkDesc", "سيرد عليك فريقنا قريباً")}</p></div>)}
        <form className="frm" method="POST" action="/api/contact">
          <div className="row">
            <input name="name" placeholder={t("contactName", "الاسم الكامل")} required minLength={3} maxLength={80} />
            <input name="email" type="email" placeholder={t("contactEmail", "البريد الإلكتروني")} required dir="ltr" />
          </div>
          <div className="row">
            <input name="phone" placeholder={t("contactPhone", "الهاتف / واتساب (اختياري)")} dir="ltr" />
            <input name="subject" placeholder={t("contactSubject", "الموضوع")} />
          </div>
          <label>{t("contactMessage", "الرسالة")}</label>
          <textarea name="message" required minLength={10} maxLength={2000} rows={5} placeholder={t("contactPlaceholder", "اكتب رسالتك هنا...")}></textarea>
          <button className="btn gold" type="submit">{t("contactSubmit", "إرسال الرسالة")}</button>
        </form>
        <div className="row" style={{ marginTop: 24, gap: 24, flexWrap: "wrap" }}>
          <div className="card"><div className="pad"><b>📧 البريد</b><p className="mut">{s?.contactFormEmail || s?.contactEmail || "info@ian-edu.org"}</p></div></div>
          <div className="card"><div className="pad"><b>📞 الهاتف</b><p className="mut">{s?.contactFormPhone || s?.contactPhone || "+20 100 000 0000"}</p></div></div>
        </div>
      </section>
    </>
  );
}