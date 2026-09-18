"use client";

import { useEffect } from "react";

export default function LocaleDocument({ locale, dir }: { locale: string; dir: "rtl" | "ltr" }) {
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = dir;
  }, [locale, dir]);

  return null;
}
