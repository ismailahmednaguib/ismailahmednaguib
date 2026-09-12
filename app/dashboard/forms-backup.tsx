// app/dashboard/forms-backup.tsx : النسخ الاحتياطي — تصدير واستيراد كل البيانات من اللوحة
"use client";
import { useState } from "react";
import { Sec } from "./ui";

export function FormBackup() {
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function exportAll() {
    setBusy(true);
    setMsg("جار تجهيز النسخة...");
    try {
      const r = await fetch("/api/backup");
      const j = await r.json();
      if (!r.ok) {
        setMsg("فشل التصدير: " + (j.error || r.status));
        return;
      }
      const blob = new Blob([JSON.stringify(j.backup, null, 2)], { type: "application/json" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      setMsg("✓ تم تنزيل النسخة الاحتياطية — احتفظ بها في مكان آمن.");
    } catch {
      setMsg("خطأ شبكة أثناء التصدير");
    } finally {
      setBusy(false);
    }
  }

  async function importFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!confirm("استيراد هذه النسخة؟ سيضيف/يحدث البيانات الحالية.")) return;
    setBusy(true);
    setMsg("جار الاستيراد...");
    try {
      const text = await f.text();
      const backup = JSON.parse(text);
      const r = await fetch("/api/backup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ backup }),
      });
      const j = await r.json();
      if (!r.ok) {
        setMsg("فشل الاستيراد: " + (j.error || r.status));
        return;
      }
      setMsg("✓ تمت الاستعادة: " + (j.restored || []).join("، ") + " — جار تحديث الصفحة...");
      setTimeout(() => location.reload(), 1200);
    } catch {
      setMsg("ملف غير صالح — تأكد أنه نسخة JSON سليمة");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Sec id="backup" title="النسخ الاحتياطي — تصدير واستيراد كل شيء">
      <p className="mut">نزّل نسخة كاملة من كل البيانات (الدورات والكتب والشهادات والإعدادات) أو استعدها من ملف.</p>
      <div className="row">
        <button className="btn gold" disabled={busy} onClick={exportAll}>⬇️ تنزيل نسخة احتياطية</button>
        <label className="btn ghost" style={{ cursor: "pointer" }}>
          ⬆️ استيراد نسخة
          <input type="file" accept=".json,application/json" hidden disabled={busy} onChange={importFile} />
        </label>
      </div>
      {msg && <p className="mut">{msg}</p>}
    </Sec>
  );
}
