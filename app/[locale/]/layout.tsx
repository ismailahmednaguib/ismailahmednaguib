import type { Metadata } from "next";
import { SITE } from "@/lib/site";
import { getSiteSettings } from "@/lib/site-settings";
import { getMessages } from "next-intl/server";
import "../../styles-01-base.css";
import "../../styles-02-layout.css";
import "../../styles-03-components.css";
import "../../styles-04-dashboard.css";
import "../../styles-05-cert.css";
import Header from "@/app/components-Header";
import Footer from "@/app/components-Footer";
import ThemeScript from "@/app/ThemeScript";
import MaintenanceBanner from "@/app/components/MaintenanceBanner";
import IntlProvider from "@/components/IntlProvider";
import PWAInstall from "@/app/components/PWAInstall";

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export const metadata: Metadata = {
  title: `${SITE.name} | ${SITE.tagline}`,
  description: "منصة تعليمية: أكاديمية شرعية + معهد تدريبي + مدرسة قرآنية + أقسام جامعية مصغرة.",
};

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params;
  const messages = await getMessages({ locale });
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
  const dir = locale === "ar" ? "rtl" : "ltr";
  
  return (
    <IntlProvider locale={locale} messages={messages}>
      <html lang={locale} dir={dir} data-theme={theme}>
        <head>
          <ThemeScript theme={theme} />
        </head>
        <body>
          <MaintenanceBanner />
          <a href="#main-content" className="skip-link">{messages.common.loading}</a>
          <div id="topbar">{full.announce} — <a href={`/${locale}/admission`}>{full.announceLink || "ساهم والتحق الآن"}</a></div>
          <Header s={s} locale={locale} />
          <main id="main-content" className="wrap" style={{ minHeight: "60vh" }}>{children}</main>
          <Footer s={s} locale={locale} />
          <PWAInstall />
        </body>
      </html>
    </IntlProvider>
  );
}