// app/dashboard/DeleteBtn.tsx : زر حذف فقط — يستدعي API ثم يحدث الصفحة
"use client";
export default function DeleteBtn({ table, id }: { table: string; id: string }) {
  async function del() {
    if (!confirm("حذف نهائي؟")) return;
    const r = await fetch(`/api/admin/${table}?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    if (r.ok) location.reload(); else alert("تعذر الحذف");
  }
  return <button className="btn sm danger" onClick={del}>حذف</button>;
}
