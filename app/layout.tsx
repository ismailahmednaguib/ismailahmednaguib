import type { Metadata } from "next";
import { SITE } from "../lib/site";
import "./styles-01-base.css";
import "./styles-02-layout.css";
import "./styles-03-components.css";
import "./styles-04-dashboard.css";
import "./styles-05-cert.css";
import Header from "./components-Header";
import Footer from "./components-Footer";

export const metadata: Metadata = {
  title: `${SITE.name} | ${SITE.tagline}`,
  description: "منصة إسماعيل أحمد نجيب: أكاديمية شرعية + معهد تدريبي + مدرسة قرآنية + أقسام جامعية مصغرة.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        <div id="topbar">وقف العلم صدقة جارية — <a href="/admission">ساهم والتحق الآن</a></div>
        <Header />
        <main className="wrap" style={{ minHeight: "60vh" }}>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
