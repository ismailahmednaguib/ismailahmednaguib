import type { Metadata } from "next";
import { routing } from "../i18n/routing";

export const metadata: Metadata = {
  title: "منصة تعليمية",
  description: "منصة تعليمية: أكاديمية شرعية + معهد تدريبي + مدرسة قرآنية + أقسام جامعية مصغرة.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang={routing.defaultLocale} dir="rtl">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>{children}</body>
    </html>
  );
}