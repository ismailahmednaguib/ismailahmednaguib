// app/dashboard/AdmissActions.tsx : قبول/رفض/حذف طلب تقديم من اللوحة
"use client";
import { useState } from "react";

export default function AdmissActions({ rowId, status }: { rowId: string; status: string }) {
  const [busy, setBusy] = useState(false);
  async function call(method: string, body?: Record<string, string>) {
    setBusy(true);
    try {
      const r = await fetch("/api/admin/admissions", {
        method,
        headers: body ? { "Content-Type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      });
      if (r.ok) location.reload();
      else alert("تعذر التنفيذ");
    } catch {
      alert("خطأ شبكة");
    } finally {
      setBusy(false);
    }
  }
  function accept() {
    if (!confirm("قبول هذا الطلب؟")) return;
    call("PUT", { id: rowId, status: "accepted" });
  }
  function reject() {
    if (!confirm("رفض هذا الطلب؟")) return;
    call("PUT", { id: rowId, status: "rejected" });
  }
  function remove() {
    if (!confirm("حذف هذا الطلب نهائيا؟")) return;
    fetch(`/api/admin/admissions?id=${encodeURIComponent(rowId)}`, { method: "DELETE" })
      .then((r) => (r.ok ? location.reload() : alert("تعذر الحذف")))
      .catch(() => alert("خطأ شبكة"));
  }
  return (
    <span className="row">
      <span className="badge">{status === "accepted" ? "مقبول" : status === "rejected" ? "مرفوض" : "جديد"}</span>
      <button className="btn sm" disabled={busy || !rowId} onClick={accept}>قبول</button>
      <button className="btn sm danger" disabled={busy || !rowId} onClick={reject}>رفض</button>
      <button className="btn sm danger" disabled={busy || !rowId} onClick={remove}>حذف</button>
    </span>
  );
}

