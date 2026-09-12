// app/components-Cert.tsx : تصميم الشهادة الرسمية المرقمة — قابلة للطباعة والتحقق
"use client";
import type { Certificate } from "../lib/types";
import type { SiteSettings } from "../lib/site-settings";

export function CertView({ cert, s, verifyUrl }: { cert: Certificate; s: SiteSettings; verifyUrl?: string }) {
  const url = verifyUrl || `/verify?code=${encodeURIComponent(cert.code)}`;
  return (
    <div className="cert-wrap">
      <div className="cert">
        <div className="cert-top">
          <div className="cert-brand"><span className="cert-logo">◈</span><b>{s.siteName}</b><small>{s.tagline}</small></div>
          <div className="cert-no">رقم الشهادة<br /><b dir="ltr">{cert.code}</b></div>
        </div>
        <h2 className="cert-title">{s.certTitle}</h2>
        <p className="cert-sub">{s.certSubtitle}</p>
        <div className="cname">{cert.student}</div>
        <p className="cert-course">لإتمامه بنجاح دورة<br /><b>{cert.course}</b></p>
        <div className="cert-meta">
          <span>التقدير: <b>{cert.grade || "—"}</b></span>
          <span>التاريخ: <b>{cert.date || "—"}</b></span>
        </div>
        <div className="cert-foot">
          <div className="cert-sign"><b>{s.certSignName}</b><small>{s.certSignTitle}</small><div className="seal">◈</div></div>
          <div className="cert-verify">
            <div className="qrcode" dir="ltr">{cert.code}</div>
            <small>{s.certFooter}</small>
            <a className="mut" href={url} style={{ fontSize: 12 }}>تحقق من هنا: {url}</a>
          </div>
        </div>
      </div>
      <div className="row noprint" style={{ justifyContent: "center", marginTop: 10 }}>
        <button className="btn gold" type="button" onClick={() => window.print()}>🖨️ طباعة الشهادة</button>
        <a className="btn ghost" href={url}>رابط التحقق</a>
      </div>
    </div>
  );
}
