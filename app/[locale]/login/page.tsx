// app/[locale]/login/page.tsx : دخول مع i18n
import LoginForm from "@/app/login/LoginForm";
import { getSiteSettings } from "@/lib/site-settings";
import { getTranslations } from "next-intl/server";

interface Props {
  params: Promise<{ locale: string }>;
  searchParams?: { [key: string]: string | string[] | undefined };
}

export const dynamic = "force-dynamic";

export default async function Login({ params, searchParams }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth" });
  const messages = (await import(`@/messages/${locale}.json`)).default;
  const err = searchParams?.err === "1";
  const s = await getSiteSettings().catch(() => null);
  const site = (k: string, fb: string) => (s && (s as Record<string, string>)[k]) || fb;
  const message = (k: string, fb: string) => {
    const value = (messages as Record<string, unknown>)[k];
    return typeof value === "string" && value ? value : fb;
  };
  const copy = (k: string, fb: string) => locale === "ar" ? site(k, message(k, fb)) : message(k, fb);

  return (
    <>
      <section className="page-head wrap">
        <h1>{copy("loginTitle", t("login"))}</h1>
        <p>{copy("loginDesc", "")}</p>
      </section>
      <section className="wrap sec">
        {err && (
          <div className="panel" style={{ borderColor: "#b3261e" }}>
            <b>{copy("loginErrTitle", t("loginError"))}</b>
            <p className="mut">{copy("loginErrDesc", t("sessionExpired"))}</p>
          </div>
        )}
        <div className="login-card">
          <LoginForm
            locale={locale}
            emailLabel={copy("loginEmail", t("email"))}
            passLabel={copy("loginPass", t("password"))}
            btnLabel={copy("loginBtn", t("login"))}
            showLabel={copy("loginShow", "إظهار")}
            hideLabel={copy("loginHide", "إخفاء")}
          />
        </div>
        <p className="mut">{copy("loginForgot", t("forgotPassword"))}</p>
      </section>
    </>
  );
}
