"use client";

import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import type { Messages } from "next-intl";

interface IntlProviderProps {
  children: React.ReactNode;
  locale: string;
  messages: Messages;
}

export default function IntlProvider({ children, locale, messages }: IntlProviderProps) {
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}