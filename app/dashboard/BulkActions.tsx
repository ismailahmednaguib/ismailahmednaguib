// app/dashboard/BulkActions.tsx : إجراءات مجمعة للجداول
"use client";
import { useState } from "react";
import { Sec } from "./ui";

interface Props {
  table: string;
  rows: Array<{ id?: string; slug?: string; code?: string; [key: string]: unknown }>;
  onComplete: () => void;
}

export default function BulkActions({ table, rows, onComplete }: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [action, setAction] = useState<"delete" | "publish" | "unpublish">("delete");
  const [busy, setBusy] = useState(false);

  const toggleAll = () => {
    if (selected.size === rows.length) setSelected(new Set());
    else setSelected(new Set(rows.map(r => String(r.id || r.slug || r.code || ""))));
  };

  const toggle = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  const execute = async () => {
    if (!selected.size) return alert("اختر عناصر أولاً");
    if (!confirm(`تنفيذ ${action === "delete" ? "حذف" : action === "publish" ? "نشر" : "إخفاء"} على ${selected.size} عنصر؟`)) return;
    
    setBusy(true);
    try {
      for (const id of Array.from(selected)) {
        if (action === "delete") {
          await fetch(`/api/admin/${table}?id=${encodeURIComponent(id)}`, { method: "DELETE" });
        } else {
          await fetch(`/api/admin/${table}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, published: action === "publish" }),
          });
        }
      }
      onComplete();
      setSelected(new Set());
    } catch {
      alert("خطأ في التنفيذ");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Sec id={`bulk-${table}`} title="إجراءات مجمعة">
      <div className="row" style={{ gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
        <label className="row" style={{ gap: 8, cursor: "pointer" }}>
          <input type="checkbox" checked={selected.size === rows.length && rows.length > 0} onChange={toggleAll} />
          <span>تحديد الكل ({rows.length})</span>
        </label>
        <select value={action} onChange={e => setAction(e.target.value as any)} className="btn sm ghost" style={{ padding: "6px 12px" }}>
          <option value="delete">🗑️ حذف المحدد</option>
          <option value="publish">📢 نشر المحدد</option>
          <option value="unpublish">🙈 إخفاء المحدد</option>
        </select>
        <button className="btn danger" disabled={busy || !selected.size} onClick={execute}>
          {busy ? "جاري التنفيذ..." : `تنفيذ (${selected.size})`}
        </button>
      </div>
      {selected.size > 0 && (
        <p className="mut">محدد: {Array.from(selected).join(", ")}</p>
      )}
    </Sec>
  );
}