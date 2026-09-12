// app/login/page.tsx : الدخول — كل النصوص من اللوحة
import LoginForm from "./LoginForm";
import { getSiteSettings } from "../../lib/site-settings";

interface Props {
  searchParams?: { [key: string]: string | string[] | undefined };
}

export const dynamic = "force-dynamic";

export default async function Login({ searchParams }: Props) {
  const err = searchParams?.err === "1";
  const s = await getSiteSettings().catch(() => null);
  return (<><section className="page-head wrap"><h1>{s?.loginTitle || "دخول الإدارة"}</h1><p>{s?.loginDesc || ""}</p></section>
  <section className="wrap sec">
  {err && (<div className="panel" style={{ borderColor: "#b3261e" }}><b>بيانات الدخول غير صحيحة</b><p className="mut">تأكد من البريد وكلمة المرور وحاول مجددا.</p></div>)}
  <LoginForm />
  <p className="mut">نسيت بيانات الدخول؟ تواصل مع إدارة المنصة.</p></section></>);
}




