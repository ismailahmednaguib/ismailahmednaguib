// app/components-Cert.tsx : تصميم الشهادة الرسمية المرقمة — كل كلمة من اللوحة
"use client";
import type { Certificate } from "../lib/types";
import type { SiteSettings } from "../lib/site-settings";
import QRCode from "@/app/components/QRCode";

export function CertView({ cert, s, verifyUrl }: { cert: Certificate; s: SiteSettings; verifyUrl?: string }) {
  const url = verifyUrl || `/verify?code=${encodeURIComponent(cert.code)}`;
  const t = (k: string, fb: string) => (s as unknown as Record<string, string>)[k] || fb;
  return (
    <div className="cert-wrap">
      <div className="cert">
        <div className="cert-top">
          <div className="cert-brand"><span className="cert-logo">◈</span><b>{s.siteName}</b><small>{s.tagline}</small></div>
          <div className="cert-no">{t("certCodeLabel", "رقم الشهادة")}<br /><b dir="ltr">{cert.code}</b></div>
        </div>
        <h2 className="cert-title">{t("certTitle", "شهادة إتمام")}</h2>
        <p className="cert-sub">{t("certSubtitle", "تشهد المنصة بأن")}</p>
        <div className="cname">{cert.student}</div>
        <p className="cert-course">{t("certCoursePrefix", "لإتمامه بنجاح دورة")}<br /><b>{cert.course}</b></p>
        <div className="cert-meta">
          <span>{t("certGradeLabel", "التقدير")}: <b>{cert.grade || "—"}</b></span>
          <span>{t("certDateLabel", "التاريخ")}: <b>{cert.date || "—"}</b></span>
        </div>
        <div className="cert-foot">
          <div className="cert-sign"><b>{t("certSignName", "إدارة المنصة")}</b><small>{t("certSignTitle", "التوقيع والختم")}</small><div className="seal">◈</div></div>
          <div className="cert-verify">
            <QRCode data={url} size={100} />
            <small>{t("certFooter", "")}</small>
            <a className="mut" href={url} style={{ fontSize: 12 }}>{t("certVerifyLink", "رابط التحقق")}: {url}</a>
          </div>
        </div>
      </div>
      <div className="row noprint" style={{ justifyContent: "center", marginTop: 10 }}>
        <button className="btn gold" type="button" onClick={() => window.print()}>{t("certPrintBtn", "🖨️ طباعة الشهادة")}</button>
        <a className="btn ghost" href={url}>{t("certVerifyLink", "رابط التحقق")}</a>
      </div>
    </div>
  );
}
