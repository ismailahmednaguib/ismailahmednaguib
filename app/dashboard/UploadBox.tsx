// app/dashboard/UploadBox.tsx : رفع ملف من اللوحة — يرفع على R2 ثم Supabase تلقائيا
"use client";
import { useState } from "react";

export default function UploadBox({ targetName, label }: { targetName: string; label: string }) {
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setBusy(true);
    setMsg("جار الرفع...");
    try {
      const fd = new FormData();
      fd.append("file", f);
      const r = await fetch("/api/upload", { method: "POST", body: fd });
      const j = await r.json();
      if (!r.ok) {
        setMsg("فشل: " + (j.error || r.status));
        return;
      }
      // الصق الرابط في حقل الهدف تلقائيا
      const input = document.querySelector(`input[name="${targetName}"]`) as HTMLInputElement | null;
      if (input && j.url) {
        input.value = j.url;
        input.focus();
      }
      setMsg(`تم الرفع عبر ${j.via === "r2" ? "Cloudflare R2" : "Supabase"} — انسخ الرابط: ${j.url || j.key}`);
    } catch (err) {
      setMsg("خطأ شبكة أثناء الرفع");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="panel" style={{ background: "var(--bg)" }}>
      <b>{label}</b>
      <p className="mut">اختر PDF أو صورة (حتى 100MB) — سيرفع على R2 أولا ثم Supabase، والرابط سيوضع في الحقل تلقائيا.</p>
      <input type="file" accept=".pdf,.png,.jpg,.jpeg,.webp,.gif,.mp3,.mp4" onChange={onFile} disabled={busy} />
      {msg && <p className="mut" style={{ wordBreak: "break-all" }}>{msg}</p>}
    </div>
  );
}
