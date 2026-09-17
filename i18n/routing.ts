import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["ar", "en"],
  defaultLocale: "ar",
  localePrefix: "as-needed",
  pathnames: {
    "/": "/",
    "/admission": "/admission",
    "/contact": "/contact",
    "/courses": "/courses",
    "/courses/[slug]": "/courses/[slug]",
    "/dashboard": "/dashboard",
    "/fatwa": "/fatwa",
    "/fatwa/[id]": "/fatwa/[id]",
    "/lessons/[id]": "/lessons/[id]",
    "/library": "/library",
    "/library/[slug]": "/library/[slug]",
    "/login": "/login",
    "/news": "/news",
    "/news/[slug]": "/news/[slug]",
    "/quran": "/quran",
    "/scholars": "/scholars",
    "/scholars/[slug]": "/scholars/[slug]",
    "/search": "/search",
    "/student": "/student",
    "/verify": "/verify",
  },
});