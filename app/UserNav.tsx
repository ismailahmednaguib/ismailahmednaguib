// app/UserNav.tsx : أزرار المستخدم (دخول/لوحة/بوابة طالب)
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import type { SiteSettings } from "./lib/site-settings";

interface Props { s: SiteSettings; }

export default function UserNav({ s }: Props) {
  const [user, setUser] = useState<{ email: string; role: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/me").then(r => r.json()).then(d => {
      if (d.ok) setUser(d.user);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <span className="mut">...</span>;

  if (!user) {
    return <Link className="btn sm gold" href="/login">{s.navCta || "دخول"}</Link>;
  }

  if (user.role === "admin") {
    return (
      <div className="row" style={{ gap: 8, alignItems: "center" }}>
        <Link className="btn sm gold" href="/dashboard">{s.navDashboard || "لوحة التحكم"}</Link>
        <Link className="btn sm ghost" href="/api/logout">خروج ({user.email})</Link>
      </div>
    );
  }

  return (
    <div className="row" style={{ gap: 8, alignItems: "center" }}>
      <Link className="btn sm gold" href="/student">📚 بوابتي</Link>
      <Link className="btn sm ghost" href="/api/logout">خروج ({user.email})</Link>
    </div>
  );
}