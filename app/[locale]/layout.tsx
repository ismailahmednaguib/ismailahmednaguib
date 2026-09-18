import type { Metadata } from "next";
import { SITE } from "@/lib/site";
import { getSiteSettings } from "@/lib/site-settings";
import { routing } from "@/i18n/routing";
import "../styles-01-base.css";
import "../styles-02-layout.css";
import "../styles-03-components.css";
import "../styles-04-dashboard.css";
import "../styles-05-cert.css";
import Header from "@/app/components-Header";
import Footer from "@/app/components-Footer";
import ThemeScript from "@/app/ThemeScript";
import MaintenanceBanner from "@/app/components/MaintenanceBanner";
import IntlProvider from "@/components/IntlProvider";
import PWAInstall from "@/app/components/PWAInstall";
import LocaleDocument from "@/app/LocaleDocument";

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

const FALLBACK_MESSAGES = {
  common: { loading: "جاري التحميل..." },
  nav: { home: "الرئيسية", courses: "الدورات", library: "المكتبة", quran: "القرآن", scholars: "العلماء", fatwa: "الفتاوى", news: "الأخبار", verify: "تحقق", admission: "التقديم" },
  footer: { about: "من نحن", contact: "تواصل", privacy: "الخصوصية", terms: "الشروط" },
};

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params;
  const validLocale = routing.locales.includes(locale as "ar" | "en") ? locale : routing.defaultLocale;

  let messages: { common?: { loading?: string }; [key: string]: unknown } = FALLBACK_MESSAGES;
  try {
    messages = (await import(`@/messages/${validLocale}.json`)).default;
  } catch {
    try {
      messages = (await import(`@/messages/${routing.defaultLocale}.json`)).default;
    } catch {
      // Keep the safe fallback messages.
    }
  }

  let full = DEFAULT_SETTINGS;
  try {
    const settings = await getSiteSettings();
    if (settings && typeof settings === "object") full = { ...DEFAULT_SETTINGS, ...settings };
  } catch {
    // Keep the safe default settings.
  }

  const messageText = (key: string, fallback: string) => {
    const value = key.split(".").reduce<unknown>((current, part) => (
      current && typeof current === "object" ? (current as Record<string, unknown>)[part] : undefined
    ), messages);
    return typeof value === "string" && value ? value : fallback;
  };

  const displaySettings = validLocale === "ar" ? full : {
    ...full,
    siteName: messageText("siteName", "Ismail Ahmed Naguib"),
    tagline: messageText("siteTagline", "Sharia Academy • Training Institute • Quran School • University Departments"),
    announce: messageText("announce", "Admissions open 2026"),
    announceLink: messageText("announceLink", "Apply and join now"),
    footerAbout: messageText("footerAbout", "Online learning, certified programs, and verifiable certificates."),
    footerRights: messageText("footerRights", "All rights reserved"),
  };

  const theme = full.themeMode || "light";
  const dir = validLocale === "ar" ? "rtl" : "ltr";

  return (
    <IntlProvider locale={validLocale} messages={messages}>
      <div lang={validLocale} dir={dir} data-theme={theme} className="locale-shell">
        <LocaleDocument locale={validLocale} dir={dir} />
        <ThemeScript theme={theme} />
        <MaintenanceBanner />
        <a href="#main-content" className="skip-link">
          {(messages.common?.loading as string) || "جاري التحميل..."}
        </a>
        <div id="topbar">
          {displaySettings.announce} — <a href={`/${validLocale}/admission`}>{displaySettings.announceLink || "ساهم والتحق الآن"}</a>
        </div>
        <Header s={displaySettings} locale={validLocale} />
        <main id="main-content" className="wrap" style={{ minHeight: "60vh" }}>{children}</main>
        <Footer s={displaySettings} locale={validLocale} />
        <PWAInstall />
      </div>
    </IntlProvider>
  );
}
