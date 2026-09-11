// app/verify/page.tsx : التحقق من الشهادات فقط
import { db } from "../../lib/db";

export const dynamic = "force-dynamic";

interface SearchProps {
  searchParams?: { [key: string]: string | string[] | undefined };
}

export default async function Verify({ searchParams }: SearchProps) {
  const raw = searchParams?.code;
  const code = (typeof raw === "string" ? raw : "").trim();
  let cert = null;
  if (code) {
    const all = await db.certs();
    cert = all.find((c) => c.code === code) || null;
  }
  return (<><section className="page-head wrap"><h1>التحقق من الشهادة</h1><p>أدخل كود الشهادة للتأكد من صحتها</p></section>
  <section className="wrap sec"><form className="frm" method="GET" action="/verify">
  <label>كود الشهادة الموجود على شهادتك</label><input name="code" defaultValue={code} placeholder="مثال: IAN-2026-1234" />
  <button className="btn gold" type="submit">تحقق</button></form>
  {code && (cert ? (<div className="cert"><h2>شهادة موثقة ✓</h2><div className="cname">{cert.student}</div>
  <p>أتم بنجاح: <b>{cert.course}</b><br />التقدير: {cert.grade} • التاريخ: {cert.date}</p>
  <div className="qrcode">{cert.code}</div><div className="seal">◈</div></div>)
  : (<p className="mut">لا توجد شهادة بهذا الكود.</p>))}</section></>);
}


