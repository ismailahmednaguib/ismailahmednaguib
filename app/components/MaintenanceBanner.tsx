// app/components/MaintenanceBanner.tsx : شريط الصيانة
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function MaintenanceBanner() {
  const [show, setShow] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/settings")
      .then(r => r.json())
      .then(d => {
        if (d.ok && d.settings) {
          const mode = d.settings.maintenanceMode === "1";
          const msg = d.settings.maintenanceMessage || "المنصة تحت الصيانة — سيعاد تشغيلها قريبا.";
          if (mode) {
            setShow(true);
            setMessage(msg);
          }
        }
      })
      .catch(() => {});
  }, []);

  if (!show) return null;

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 9999,
      background: "#b3261e",
      color: "#fff",
      padding: "12px 20px",
      textAlign: "center",
      fontWeight: 600,
      boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
    }}>
      <span>⚠️ {message}</span>
      <Link href="/login" style={{ marginLeft: 16, color: "#fff", textDecoration: "underline" }}>دخول الإدارة</Link>
    </div>
  );
}