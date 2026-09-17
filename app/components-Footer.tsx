"use client";
import Link from "next/link";
import { useTranslations } from "next-intl";
import type { SiteSettings } from "../lib/site-settings";

export default function Footer({ s, locale }: { s: SiteSettings; locale: string }) {
  const t = useTranslations("footer");
  const nav = useTranslations("nav");
  return (
    <footer>
      <div className="fgrid">
        <div><h4>{s.siteName}</h4><p className="mut" style={{ color: "#b9c9c0" }}>{s.footerAbout || s.tagline}</p></div>
        <div><h4>{t("about")}</h4><Link href={`/${locale}/courses`}>{nav("courses")}</Link><Link href={`/${locale}/library`}>{nav("library")}</Link><Link href={`/${locale}/quran`}>{nav("quran")}</Link><Link href={`/${locale}/verify`}>{nav("verify")}</Link></div>
        <div><h4>{t("contact")}</h4><Link href={`/${locale}/admission`}>{nav("admission")}</Link><Link href={`/${locale}/login`}>{nav("login")}</Link><Link href={`/${locale}/dashboard`}>{nav("dashboard")}</Link></div>
        <div><h4>{t("contact")}</h4><p style={{ fontSize: 13 }}>{s.contactEmail}<br />{s.contactPhone}</p></div>
      </div>
      <div className="copy">© 2026 {s.siteName} — {s.footerRights}</div>
    </footer>
  );
}