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
  const err = searchParams?.err === "1";
  const s = await getSiteSettings().catch(() => null);
  const site = (k: string, fb: string) => (s && (s as Record<string, string>)[k]) || fb;

  return (
    <>
      <section className="page-head wrap">
        <h1>{site("loginTitle", t("login"))}</h1>
        <p>{site("loginDesc", "")}</p>
      </section>
      <section className="wrap sec">
        {err && (
          <div className="panel" style={{ borderColor: "#b3261e" }}>
            <b>{site("loginErrTitle", t("loginError"))}</b>
            <p className="mut">{site("loginErrDesc", t("sessionExpired"))}</p>
          </div>
        )}
        <LoginForm
          emailLabel={site("loginEmail", t("email"))}
          passLabel={site("loginPass", t("password"))}
          btnLabel={site("loginBtn", t("login"))}
          showLabel={site("loginShow", "إظهار")}
          hideLabel={site("loginHide", "إخفاء")}
        />
        <p className="mut">{site("loginForgot", t("forgotPassword"))}</p>
      </section>
    </>
  );
}