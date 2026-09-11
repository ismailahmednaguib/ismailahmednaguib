// app/login/page.tsx : الدخول فقط — بدون أي بيانات تجريبية ظاهرة
import LoginForm from "./LoginForm";

interface Props {
  searchParams?: { [key: string]: string | string[] | undefined };
}

export const dynamic = "force-dynamic";

export default function Login({ searchParams }: Props) {
  const err = searchParams?.err === "1";
  return (<><section className="page-head wrap"><h1>دخول الإدارة</h1><p>خاص بإدارة المنصة فقط</p></section>
  <section className="wrap sec">
  {err && (<div className="panel" style={{ borderColor: "#b3261e" }}><b>بيانات الدخول غير صحيحة</b><p className="mut">تأكد من البريد وكلمة المرور وحاول مجددا.</p></div>)}
  <LoginForm />
  <p className="mut">نسيت بيانات الدخول؟ تواصل مع إدارة المنصة.</p></section></>);
}



