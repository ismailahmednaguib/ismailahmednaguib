// app/verify/page.tsx : التحقق من الشهادات — كل كلمة من اللوحة + تصميم رسمي
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
  const t = (k: string, fb: string) => (s && (s as Record<string, string>)[k]) || fb;
  let cert = null;
  if (code) {
    const all = await db.certs();
    cert = all.find((c) => c.code === code) || null;
  }
  return (<><section className="page-head wrap"><h1>{t("verifyTitle", "التحقق من الشهادة")}</h1><p>{t("verifyDesc", "")}</p></section>
  <section className="wrap sec"><form className="frm noprint" method="GET" action="/verify">
  <label>{t("verifyLabel", "كود الشهادة")}</label><input name="code" defaultValue={code} placeholder={t("verifyPlaceholder", "مثال: IAN-2026-0001")} dir="ltr" />
  <button className="btn gold" type="submit">{t("verifyBtn", "تحقق")}</button></form>
  {code && (cert
    ? (<CertView cert={cert} s={(s || {}) as never} />)
    : (<p className="mut">{t("verifyNotFound", "لا توجد شهادة بهذا الكود.")}</p>))}</section></>);
}




