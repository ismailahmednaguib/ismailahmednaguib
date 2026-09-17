import type { Metadata } from "next";
import { SITE } from "@/lib/site";
import { getSiteSettings } from "@/lib/site-settings";
import { getMessages } from "next-intl/server";
import { routing } from "@/i18n/routing";
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

const DEFAULT_SETTINGS = {
  siteName: SITE.name,
  tagline: SITE.tagline,
  announce: "التقديم مفتوح",
  announceLink: "ساهم والتحق الآن",
  contactEmail: SITE.contact.email,
  contactPhone: SITE.contact.phone,
  heroKicker: "",
  heroTitle: SITE.name,
  heroDesc: "",
  footerAbout: "",
  footerRights: "جميع الحقوق محفوظة",
  themeMode: "light",
};

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params;
  
  // التحقق من الـ locale
  const validLocale = routing.locales.includes(locale as "ar" | "en") ? locale : routing.defaultLocale;
  
  // تحميل الرسائل مع fallback
  let messages: { common?: { loading?: string }; [key: string]: unknown } = {};
  try {
    messages = await getMessages({ locale: validLocale });
  } catch {
    messages = (await import(`@/messages/${routing.defaultLocale}.json`)).default;
  }
  
  // تحميل الإعدادات مع fallback
  let full = DEFAULT_SETTINGS;
  try {
    const s = await getSiteSettings();
    if (s && typeof s === "object") {
      full = { ...DEFAULT_SETTINGS, ...s };
    }
  } catch {
    // استخدام الافتراضي
  }
  
  const theme = full.themeMode || "light";
  const dir = validLocale === "ar" ? "rtl" : "ltr";
  
  return (
    <IntlProvider locale={validLocale} messages={messages}>
      <html lang={validLocale} dir={dir} data-theme={theme}>
        <head>
          <ThemeScript theme={theme} />
        </head>
        <body>
          <MaintenanceBanner />
          <a href="#main-content" className="skip-link">{(messages.common?.loading as string) || "جاري التحميل..."}</a>
          <div id="topbar">{full.announce} — <a href={`/${validLocale}/admission`}>{full.announceLink || "ساهم والتحق الآن"}</a></div>
          <Header s={full} locale={validLocale} />
          <main id="main-content" className="wrap" style={{ minHeight: "60vh" }}>{children}</main>
          <Footer s={full} locale={validLocale} />
          <PWAInstall />
        </body>
      </html>
    </IntlProvider>
  );
}