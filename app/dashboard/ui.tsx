// app/dashboard/ui.tsx : عناصر مشتركة للوحة فقط (قسم + جدول)
import type { ReactNode } from "react";
import DeleteBtn from "./DeleteBtn";

export interface DashboardRow {
  __t: string;
  id?: string;
  slug?: string;
  code?: string;
  [key: string]: unknown;
}

export function Sec({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (<section id={id} className="panel"><h3 style={{ marginTop: 0 }}>⚙️ {title}</h3>{children}</section>);
}

export function Tbl({ rows, cols }: { rows: DashboardRow[]; cols: string[] }) {
  if (!rows.length) return <p className="mut">لا بيانات بعد.</p>;
  return (<div style={{ overflowX: "auto" }}><table className="tbl"><thead><tr>
  {cols.map((c) => (<th key={c}>{c}</th>))}<th>حذف</th></tr></thead><tbody>
  {rows.map((r, i) => (<tr key={String(r.id || r.slug || r.code || i)}>
  {cols.map((c) => (<td key={c}>{String(r[c] ?? "")}</td>))}
  <td><DeleteBtn table={r.__t} id={String(r.id || r.slug || r.code || "")} /></td></tr>))}
  </tbody></table></div>);
}

