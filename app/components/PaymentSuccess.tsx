// components/PaymentSuccess.tsx : صفحة نجاح الدفع
"use client";
import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";

interface PaymentSuccessProps {
  locale: string;
  sessionId?: string;
  userEmail: string;
}

export default function PaymentSuccess({ locale, sessionId, userEmail }: PaymentSuccessProps) {
  const t = useTranslations("payments");
  const [payment, setPayment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (sessionId) {
      verifyPayment();
    } else {
      setLoading(false);
      setError(t("noSessionId"));
    }
  }, [sessionId, locale]);

  const verifyPayment = async () => {
    try {
      const res = await fetch(`/${locale}/api/payments/verify?session_id=${sessionId}`);
      const data = await res.json();
      if (data.ok) {
        setPayment(data.payment);
      } else {
        setError(data.error || t("verificationFailed"));
      }
    } catch {
      setError(t("networkError"));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="payment-success loading">
        <div className="spinner"></div>
        <p>{t("verifying")}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="payment-success error">
        <div className="icon">❌</div>
        <h2>{t("paymentFailed")}</h2>
        <p>{error}</p>
        <Link href={`/${locale}/courses`} className="btn gold">
          {t("backToCourses")}
        </Link>
      </div>
    );
  }

  return (
    <div className="payment-success success">
      <div className="icon">✅</div>
      <h2>{t("paymentSuccess")}</h2>
      {payment && (
        <div className="payment-details">
          <p><strong>{t("course")}:</strong> {payment.course_title || payment.course_slug}</p>
          <p><strong>{t("amount")}:</strong> {payment.amount ? (payment.amount / 100).toFixed(2) : "—"} {payment.currency || "SAR"}</p>
          <p><strong>{t("transactionId")}:</strong> {payment.provider_payment_id || payment.id}</p>
          <p><strong>{t("date")}:</strong> {new Date(payment.completed_at || payment.created_at).toLocaleDateString(locale === "ar" ? "ar-SA" : "en-US")}</p>
        </div>
      )}
      <div className="actions">
        <Link href={`/${locale}/student`} className="btn gold">
          {t("goToDashboard")}
        </Link>
        <Link href={`/${locale}/courses`} className="btn ghost">
          {t("continueShopping")}
        </Link>
      </div>
    </div>
  );
}