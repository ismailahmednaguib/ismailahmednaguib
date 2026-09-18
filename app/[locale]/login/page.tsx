// app/[locale]/login/page.tsx : دخول مع i18n
import LoginForm from "@/app/login/LoginForm";
import { getSiteSettings } from "@/lib/site-settings";

interface Props {
  params: Promise<{ locale: string }>;
  searchParams?: { [key: string]: string | string[] | undefined };
}

export const dynamic = "force-dynamic";

export default async function Login({ params, searchParams }: Props) {
  const { locale } = await params;
  const messages = (await import(`@/messages/${locale}.json`)).default;
  const err = searchParams?.err === "1";
  const s = await getSiteSettings().catch(() => null);
  const site = (k: string, fb: string) => (s && (s as Record<string, string>)[k]) || fb;
  const message = (k: string, fb: string) => {
    const value = k.split(".").reduce<unknown>((current, part) => (
      current && typeof current === "object" ? (current as Record<string, unknown>)[part] : undefined
    ), messages);
    return typeof value === "string" && value ? value : fb;
  };
  const copy = (k: string, fb: string) => locale === "ar" ? site(k, message(k, fb)) : message(k, fb);
  const auth = (k: string, fb: string) => message(`auth.${k}`, fb);

  return (
    <>
      <section className="page-head wrap">
        <h1>{copy("loginTitle", auth("login", "دخول"))}</h1>
        <p>{copy("loginDesc", "")}</p>
      </section>
      <section className="wrap sec">
        {err && (
          <div className="panel" style={{ borderColor: "#b3261e" }}>
            <b>{copy("loginErrTitle", auth("loginError", "بيانات الدخول غير صحيحة"))}</b>
            <p className="mut">{copy("loginErrDesc", auth("sessionExpired", "انتهت الجلسة، حاول مرة أخرى"))}</p>
          </div>
        )}
        <div className="login-card">
          <LoginForm
            locale={locale}
            emailLabel={copy("loginEmail", auth("email", "البريد الإلكتروني"))}
            passLabel={copy("loginPass", auth("password", "كلمة المرور"))}
            btnLabel={copy("loginBtn", auth("login", "دخول"))}
            showLabel={copy("loginShow", "إظهار")}
            hideLabel={copy("loginHide", "إخفاء")}
          />
        </div>
        <p className="mut">{copy("loginForgot", auth("forgotPassword", "نسيت بيانات الدخول؟ تواصل مع الإدارة."))}</p>
      </section>
    </>
  );
}
