"use client";

import { NextIntlClientProvider } from "next-intl";
import { useParams } from "next/navigation";

export default function IntlProvider({ 
  locale, 
  messages, 
  children 
}: { 
  locale: string; 
  messages: Record<string, unknown>; 
  children: React.ReactNode;
}) {
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}