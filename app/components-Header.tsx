// app/components-Header.tsx : الهيدر والقائمة — كل كلمة من اللوحة
"use client";
import Link from "next/link";
import { useTranslations } from "next-intl";
import NavBurger from "./NavBurger";
import SearchBox from "./components-Search";
import UserNav from "./UserNav";
import ThemeToggle from "./ThemeToggle";
import LanguageToggle from "./LanguageToggle";
import NotificationBell from "./components/NotificationBell";
import type { SiteSettings } from "../lib/site-settings";

export default function Header({ s, locale }: { s: SiteSettings; locale: string }) {
  const t = useTranslations("nav");
  const LINKS = [
    { href: `/${locale}`, label: t("home") },
    { href: `/${locale}/courses`, label: t("courses") },
    { href: `/${locale}/library`, label: t("library") },
    { href: `/${locale}/quran`, label: t("quran") },
    { href: `/${locale}/scholars`, label: t("scholars") },
    { href: `/${locale}/fatwa`, label: t("fatwa") },
    { href: `/${locale}/news`, label: t("news") },
    { href: `/${locale}/verify`, label: t("verify") },
    { href: `/${locale}/admission`, label: t("admission") },
  ];
  return (
    <header id="siteHeader">
      <div className="head-in">
        <NavBurger />
        <Link href={`/${locale}`} className="brand">
          <span className="logo">◈</span>
          <span><b>{s.siteName}</b><small>{s.tagline}</small></span>
        </Link>
        <nav id="mainNav">
          {LINKS.map((l) => (<Link key={l.href} href={l.href}>{l.label}</Link>))}
        </nav>
        <div className="hact">
          <SearchBox placeholder={t("search")} className="header-search" />
          <NotificationBell locale={locale} />
          <LanguageToggle locale={locale} />
          <ThemeToggle />
          <UserNav s={s} locale={locale} />
        </div>
      </div>
    </header>
  );
}
