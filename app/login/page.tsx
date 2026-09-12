// app/login/page.tsx : الدخول — كل كلمة من اللوحة
import LoginForm from "./LoginForm";
import { getSiteSettings } from "../../lib/site-settings";

interface Props {
  searchParams?: { [key: string]: string | string[] | undefined };
}

export const dynamic = "force-dynamic";

export default async function Login({ searchParams }: Props) {
  const err = searchParams?.err === "1";
  const s = await getSiteSettings().catch(() => null);
  const t = (k: string, fb: string) => (s && (s as Record<string, string>)[k]) || fb;
  return (<><section className="page-head wrap"><h1>{t("loginTitle", "دخول الإدارة")}</h1><p>{t("loginDesc", "")}</p></section>
  <section className="wrap sec">
  {err && (<div className="panel" style={{ borderColor: "#b3261e" }}><b>{t("loginErrTitle", "بيانات الدخول غير صحيحة")}</b><p className="mut">{t("loginErrDesc", "")}</p></div>)}
  <LoginForm emailLabel={t("loginEmail", "البريد الإلكتروني")} passLabel={t("loginPass", "كلمة المرور")} btnLabel={t("loginBtn", "دخول")} showLabel={t("loginShow", "إظهار")} hideLabel={t("loginHide", "إخفاء")} />
  <p className="mut">{t("loginForgot", "")}</p></section></>);
}





