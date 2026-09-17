// app/UserNav.tsx : أزرار المستخدم (دخول/لوحة/بوابة طالب)
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import type { SiteSettings } from "../lib/site-settings";

interface Props { s: SiteSettings; locale: string; }

export default function UserNav({ s, locale }: Props) {
  const t = useTranslations("nav");
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
    return <Link className="btn sm gold" href={`/${locale}/login`}>{t("login")}</Link>;
  }

  if (user.role === "admin") {
    return (
      <div className="row" style={{ gap: 8, alignItems: "center" }}>
        <Link className="btn sm gold" href={`/${locale}/dashboard`}>{t("dashboard")}</Link>
        <Link className="btn sm ghost" href={`/${locale}/api/logout`}>{t("logout")} ({user.email})</Link>
      </div>
    );
  }

  return (
    <div className="row" style={{ gap: 8, alignItems: "center" }}>
      <Link className="btn sm gold" href={`/${locale}/student`}>{t("student")}</Link>
      <Link className="btn sm ghost" href={`/${locale}/api/logout`}>{t("logout")} ({user.email})</Link>
    </div>
  );
}