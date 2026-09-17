// components/PaymentButton.tsx : زر الدفع للكورسات
"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";

interface PaymentButtonProps {
  courseSlug: string;
  courseTitle: string;
  price: number; // بالهللات/السنتات
  locale: string;
  userEmail: string;
  userRole: string;
  className?: string;
  disabled?: boolean;
}

export default function PaymentButton({ 
  courseSlug, 
  courseTitle, 
  price, 
  locale, 
  userEmail, 
  userRole,
  className = "",
  disabled = false
}: PaymentButtonProps) {
  const t = useTranslations("payments");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formatPrice = (amount: number) => {
    return (amount / 100).toFixed(2);
  };

  const handleClick = async () => {
    if (loading || disabled) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/${locale}/api/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseSlug }),
      });
      const data = await res.json();
      if (data.ok && data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || t("paymentError"));
      }
    } catch {
      setError(t("networkError"));
    } finally {
      setLoading(false);
    }
  };

  if (price === 0) {
    return (
      <Link href={`/${locale}/api/student/enroll?course=${courseSlug}`} className={`btn gold ${className}`}>
        {t("enrollFree")}
      </Link>
    );
  }

  if (userRole === "admin") {
    return (
      <span className={`badge admin-badge ${className}`}>{t("adminFree")}</span>
    );
  }

  return (
    <div className={`payment-button-wrapper ${className}`}>
      {error && <div className="payment-error">{error}</div>}
      <button
        className={`btn gold ${loading ? "loading" : ""}`}
        onClick={handleClick}
        disabled={loading || disabled}
      >
        {loading ? t("processing") : `${t("payNow")} ${formatPrice(price)} ${t("currency")}`}
      </button>
    </div>
  );
}