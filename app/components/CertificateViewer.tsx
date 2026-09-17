// components/CertificateViewer.tsx : عرض الشهادة مع خيارات التحميل والطباعة
"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";

interface Certificate {
  code: string;
  course: string;
  student: string;
  date: string;
  grade: string;
  courseTitle?: string;
}

export default function CertificateViewer({ 
  certificate, 
  locale,
  onClose 
}: { 
  certificate: Certificate; 
  locale: string;
  onClose?: () => void;
}) {
  const t = useTranslations("certificates");
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/${locale}/api/certificates?code=${certificate.code}`);
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `certificate-${certificate.code}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert(t("pdfError"));
      }
    } catch {
      alert(t("pdfError"));
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.open(`/${locale}/api/certificates?code=${certificate.code}`, "_blank");
  };

  const verifyUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/${locale}/verify?code=${certificate.code}`;

  return (
    <div className="certificate-viewer">
      <div className="certificate-header">
        <h2>{t("certificateDetails")}</h2>
        {onClose && (
          <button className="btn ghost" onClick={onClose}>{t("close")}</button>
        )}
      </div>
      
      <div className="certificate-card">
        <div className="cert-badge">📜</div>
        <h3>{certificate.courseTitle || certificate.course}</h3>
        <p className="cert-subtitle">{t("issuedTo")}</p>
        <p className="cert-name">{certificate.student}</p>
        <div className="cert-meta">
          <div><span className="label">{t("certificateId")}:</span> <span className="value">{certificate.code}</span></div>
          <div><span className="label">{t("issueDate")}:</span> <span className="value">{certificate.date}</span></div>
          <div><span className="label">{t("grade")}:</span> <span className="value">{certificate.grade}</span></div>
        </div>
        <div className="cert-verify">
          <p className="verify-text">{t("verifyUrl")}:</p>
          <code>{verifyUrl}</code>
        </div>
      </div>

      <div className="certificate-actions">
        <button className="btn gold" onClick={handleDownload} disabled={loading}>
          {loading ? t("generatingPdf") : t("downloadPdf")}
        </button>
        <button className="btn" onClick={handlePrint}>{t("print")}</button>
        <Link href={`/${locale}/verify?code=${certificate.code}`} className="btn ghost" target="_blank">
          {t("verifyCertificate")}
        </Link>
        {onClose && <button className="btn ghost" onClick={onClose}>{t("close")}</button>}
      </div>
    </div>
  );
}