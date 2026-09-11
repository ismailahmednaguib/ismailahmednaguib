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

export const metadata: Metadata = {
  title: `${SITE.name} | ${SITE.tagline}`,
  description: "منصة تعليمية: أكاديمية شرعية + معهد تدريبي + مدرسة قرآنية + أقسام جامعية مصغرة.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const s = await getSiteSettings().catch(() => ({
    siteName: SITE.name, tagline: SITE.tagline, announce: "التقديم مفتوح",
    contactEmail: SITE.contact.email, contactPhone: SITE.contact.phone,
    heroKicker: "", heroTitle: SITE.name, heroDesc: "",
  }));
  return (
    <html lang="ar" dir="rtl">
      <body>
        <div id="topbar">{s.announce} — <a href="/admission">ساهم والتحق الآن</a></div>
        <Header siteName={s.siteName} tagline={s.tagline} />
        <main className="wrap" style={{ minHeight: "60vh" }}>{children}</main>
        <Footer siteName={s.siteName} tagline={s.tagline} contactEmail={s.contactEmail} contactPhone={s.contactPhone} />
      </body>
    </html>
  );
}

