// app/dashboard/FilesTbl.tsx : إدارة الملفات المرفقة
"use client";
import { useState, useEffect } from "react";
import { Sec } from "./ui";

interface FileItem {
  key: string;
  name: string;
  size: number;
  type: string;
  url: string;
}

export default function FilesTbl() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetch("/api/admin/files").then(r => r.json()).then(d => {
      if (d.ok) setFiles(d.files || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const handleDelete = async (key: string) => {
    if (!confirm("حذف هذا الملف نهائياً؟")) return;
    setBusy(key);
    try {
      const res = await fetch(`/api/admin/files?key=${encodeURIComponent(key)}`, { method: "DELETE" });
      if (res.ok) {
        setFiles(prev => prev.filter(f => f.key !== key));
        setMsg("✓ تم حذف الملف");
      } else {
        setMsg("فشل الحذف");
      }
    } catch {
      setMsg("خطأ شبكة");
    } finally {
      setBusy(null);
      setTimeout(() => setMsg(""), 3000);
    }
  };

  if (loading) return <Sec id="files" title="ملفات المنصة"><p className="mut">جاري التحميل...</p></Sec>;

  return (
    <Sec id="files" title="ملفات المنصة — رفع / تحميل / حذف">
      {msg && <p className="mut">{msg}</p>}
      {files.length ? (
        <div style={{ overflowX: "auto" }}>
          <table className="tbl"><thead><tr>
            <th>الملف</th><th>النوع</th><th>الحجم</th><th>الرابط</th><th>تحميل</th><th>حذف</th>
          </tr></thead><tbody>
            {files.map(f => (
              <tr key={f.key}>
                <td>{f.name}</td>
                <td className="mut">{f.type || "—"}</td>
                <td className="mut">{formatSize(f.size)}</td>
                <td className="mut" style={{ maxWidth: 300 }}><input type="text" value={f.url} readOnly style={{ width: "100%", fontSize: 11 }} onClick={e => { (e.currentTarget as HTMLInputElement).select(); }} /></td>
                <td><a className="btn sm" href={f.url} target="_blank" rel="noreferrer">⬇️</a></td>
                <td><button className="btn sm danger" disabled={busy === f.key} onClick={() => handleDelete(f.key)}>
                  {busy === f.key ? "⏳" : "🗑️"}
                </button></td>
              </tr>
            ))}
          </tbody></table>
        </div>
      ) : (
        <p className="mut">لا توجد ملفات مرفقة بعد.</p>
      )}
    </Sec>
  );
}