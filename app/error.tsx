// app/error.tsx : صفحة خطأ عامة
"use client";
import { useEffect } from "react";
import Link from "next/link";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div style={{ 
      minHeight: "60vh", 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center",
      padding: 20,
      textAlign: "center"
    }}>
      <div className="panel" style={{ maxWidth: 400 }}>
        <h2 style={{ color: "#b3261e", marginTop: 0 }}>⚠️ حدث خطأ</h2>
        <p className="mut">عذراً، حدث خطأ غير متوقع. فريق المنصة يعمل على إصلاحه.</p>
        <div className="row" style={{ justifyContent: "center", marginTop: 16, gap: 12 }}>
          <button className="btn gold" onClick={reset}>إعادة المحاولة</button>
          <Link className="btn ghost" href="/">العودة للرئيسية</Link>
        </div>
        {process.env.NODE_ENV === "development" && (
          <details style={{ marginTop: 16, textAlign: "start" }}>
            <summary className="mut">تفاصيل الخطأ (تطوير)</summary>
            <pre style={{ fontSize: 11, overflow: "auto", maxHeight: 200, background: "#1a1a1a", color: "#0f0", padding: 12, borderRadius: 8, marginTop: 8 }}>
              {error.message}\n{error.digest && `Digest: ${error.digest}`}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}