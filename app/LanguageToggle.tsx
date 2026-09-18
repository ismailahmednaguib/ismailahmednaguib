"use client";

import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

interface LanguageToggleProps {
  locale: string;
}

export default function LanguageToggle({ locale }: LanguageToggleProps) {
  const router = useRouter();
  const pathname = usePathname() || "/";
  const t = useTranslations("language");
  const nextLocale = locale === "ar" ? "en" : "ar";

  function switchLanguage() {
    const localePrefix = `/${locale}`;
    const rest = pathname === localePrefix
      ? "/"
      : pathname.startsWith(`${localePrefix}/`)
        ? pathname.slice(localePrefix.length)
        : pathname;
    const target = `/${nextLocale}${rest === "/" ? "" : rest}`;
    const query = typeof window !== "undefined" ? window.location.search : "";
    router.push(`${target || "/"}${query}`);
  }

  return (
    <button
      type="button"
      className="language-toggle"
      onClick={switchLanguage}
      aria-label={t("switch")}
      title={t("switch")}
    >
      <span aria-hidden="true">🌐</span>
      <span>{t(nextLocale)}</span>
    </button>
  );
}
