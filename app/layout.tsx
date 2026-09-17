import type { Metadata } from "next";
import { SITE } from "../lib/site";
import { getSiteSettings } from "../lib/site-settings";
import "./styles-01-base.css";
import "./styles-02-layout.css";
import "./styles-03-components.css";
import "./styles-04-dashboard.css";
import "./styles-05-cert.css";
import Header from "./components-Header";
import Footer from "./components-Footer";
import ThemeScript from "./ThemeScript";
import MaintenanceBanner from "./components/MaintenanceBanner";

export const metadata: Metadata = {
  title: `${SITE.name} | ${SITE.tagline}`,
  description: "منصة تعليمية: أكاديمية شرعية + معهد تدريبي + مدرسة قرآنية + أقسام جامعية مصغرة.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const s = await getSiteSettings().catch(() => ({
    siteName: SITE.name, tagline: SITE.tagline, announce: "التقديم مفتوح",
    announceLink: "ساهم والتحق الآن",
    contactEmail: SITE.contact.email, contactPhone: SITE.contact.phone,
    heroKicker: "", heroTitle: SITE.name, heroDesc: "",
    footerAbout: "", footerRights: "جميع الحقوق محفوظة",
    themeMode: "light",
  } as never));
  const full = s as never as Record<string, string>;
  const theme = full.themeMode || "light";
  
  return (
    <html lang="ar" dir="rtl" data-theme={theme}>
      <head>
        <ThemeScript theme={theme} />
      </head>
      <body>
        <MaintenanceBanner />
        <a href="#main-content" className="skip-link">تخطي إلى المحتوى الرئيسي</a>
        <div id="topbar">{full.announce} — <a href="/admission">{full.announceLink || "ساهم والتحق الآن"}</a></div>
        <Header s={s} />
        <main id="main-content" className="wrap" style={{ minHeight: "60vh" }}>{children}</main>
        <Footer s={s} />
      </body>
    </html>
  );
}