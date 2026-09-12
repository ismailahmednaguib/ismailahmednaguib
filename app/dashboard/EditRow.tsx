// app/dashboard/EditRow.tsx : تعديل أي صف من اللوحة — يفتح نموذج معبأ ويرسل PUT
"use client";
import { useState } from "react";

export interface EditField { name: string; label: string; type?: "text" | "number" | "select" | "textarea" | "checkbox"; options?: string[]; readonly?: boolean; }

export default function EditRow({ table, row, fields }: { table: string; row: Record<string, unknown>; fields: EditField[] }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [vals, setVals] = useState<Record<string, string>>(() => {
    const o: Record<string, string> = {};
    for (const f of fields) {
      const v = row[f.name];
      o[f.name] = typeof v === "boolean" ? (v ? "1" : "") : String(v ?? "");
    }
    return o;
  });

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const body: Record<string, unknown> = {};
      for (const f of fields) {
        if (f.type === "number") body[f.name] = Number(vals[f.name] || 0);
        else if (f.type === "checkbox") body[f.name] = vals[f.name] === "1" ? "1" : "";
        else body[f.name] = vals[f.name] ?? "";
      }
      // مفتاح الصف الأصلي حتى لو اتعدل
      const key = String(row.id || row.slug || row.code || "");
      if (!body["id"] && !body["slug"] && !body["code"]) {
        if (row.id) body["id"] = row.id;
        else if (row.slug) body["slug"] = row.slug;
        else if (row.code) body["code"] = row.code;
        else body["id"] = key;
      }
      const r = await fetch(`/api/admin/${table}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (r.ok) location.reload();
      else alert("تعذر الحفظ");
    } catch {
      alert("خطأ شبكة");
    } finally {
      setBusy(false);
    }
  }

  if (!open) return <button className="btn sm ghost" onClick={() => setOpen(true)}>تعديل</button>;
  return (
    <span>
      <button className="btn sm ghost" onClick={() => setOpen(false)}>إغلاق</button>
      <span className="panel" style={{ display: "block", marginTop: 8, minWidth: 260 }}>
        <form className="frm" onSubmit={save}>
          {fields.map((f) => (
            <div key={f.name}>
              <label>{f.label}</label>
              {f.type === "select" ? (
                <select value={vals[f.name] || ""} disabled={f.readonly} onChange={(e) => setVals((v) => ({ ...v, [f.name]: e.target.value }))}>
                  {(f.options || []).map((o) => (<option key={o} value={o}>{o}</option>))}
                </select>
              ) : f.type === "textarea" ? (
                <textarea value={vals[f.name] || ""} rows={2} onChange={(e) => setVals((v) => ({ ...v, [f.name]: e.target.value }))} />
              ) : f.type === "checkbox" ? (
                <label><input type="checkbox" style={{ width: "auto" }} checked={vals[f.name] === "1"} onChange={(e) => setVals((v) => ({ ...v, [f.name]: e.target.checked ? "1" : "" }))} /> مفعّل</label>
              ) : (
                <input type={f.type === "number" ? "number" : "text"} value={vals[f.name] || ""} readOnly={f.readonly} dir={f.name === "slug" || f.name === "code" || f.name === "videoUrl" || f.name === "pdfUrl" ? "ltr" : undefined} onChange={(e) => setVals((v) => ({ ...v, [f.name]: e.target.value }))} />
              )}
            </div>
          ))}
          <button className="btn sm gold" disabled={busy} type="submit">{busy ? "جار الحفظ..." : "حفظ التعديل"}</button>
        </form>
      </span>
    </span>
  );
}
