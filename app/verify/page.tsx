// app/verify/page.tsx : التحقق من الشهادات — تصميم رسمي مرقم قابل للطباعة
import { db } from "../../lib/db";
import { getSiteSettings } from "../../lib/site-settings";
import { CertView } from "../components-Cert";

export const dynamic = "force-dynamic";

interface SearchProps {
  searchParams?: { [key: string]: string | string[] | undefined };
}

export default async function Verify({ searchParams }: SearchProps) {
  const raw = searchParams?.code;
  const code = (typeof raw === "string" ? raw : "").trim();
  const s = await getSiteSettings().catch(() => null);
  const fb = {
    siteName: "منصتنا التعليمية", tagline: "", certTitle: "شهادة إتمام",
    certSubtitle: "تشهد المنصة بأن", certFooter: "هذه الشهادة موثقة ويمكن التحقق منها بالكود أدناه",
    certSignName: "إدارة المنصة", certSignTitle: "التوقيع والختم",
    verifyTitle: "التحقق من الشهادة", verifyDesc: "أدخل كود الشهادة الموجود على شهادتك للتأكد من صحتها",
  };
  const t = { ...fb, ...(s || {}) };
  let cert = null;
  if (code) {
    const all = await db.certs();
    cert = all.find((c) => c.code === code) || null;
  }
  return (<><section className="page-head wrap"><h1>{t.verifyTitle}</h1><p>{t.verifyDesc}</p></section>
  <section className="wrap sec"><form className="frm noprint" method="GET" action="/verify">
  <label>كود الشهادة الموجود على شهادتك</label><input name="code" defaultValue={code} placeholder="مثال: IAN-2026-0001" dir="ltr" />
  <button className="btn gold" type="submit">تحقق</button></form>
  {code && (cert
    ? (<CertView cert={cert} s={t as never} />)
    : (<p className="mut">لا توجد شهادة بهذا الكود — تأكد من الرقم وحاول مجددا.</p>))}</section></>);
}



