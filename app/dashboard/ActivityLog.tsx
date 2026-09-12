// app/dashboard/ActivityLog.tsx : عرض سجل النشاطات
"use client";
import { useState, useEffect } from "react";
import { Sec } from "./ui";

type Activity = {
  id: string;
  type: string;
  table: string;
  itemId: string;
  itemTitle: string;
  userEmail: string;
  userRole: string;
  details?: string;
  ip?: string;
  createdAt: string;
};

const TYPE_LABELS: Record<string, string> = {
  login: "🔐 دخول", add: "➕ إضافة", edit: "✏️ تعديل", delete: "🗑️ حذف",
  export: "📤 تصدير", import: "📥 استيراد", backup: "💾 نسخة احتياطية",
  role: "👤 دور", password: "🔑 باسورد", email: "📧 بريد"
};
const TYPE_COLORS: Record<string, string> = {
  login: "var(--g)", add: "var(--g2)", edit: "#c9a227", delete: "#b3261e",
  export: "#6b766f", import: "#6b766f", backup: "var(--g)",
  role: "#147052", password: "#c9a227", email: "#147052"
};

export default function ActivityLog() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const PER_PAGE = 20;

  useEffect(() => {
    fetch("/api/activity").then(r => r.json()).then(d => {
      if (d.ok) setActivities(d.activities || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filtered = filter === "all" ? activities : activities.filter(a => a.type === filter);
  const totalPages = Math.ceil(filtered.length / PER_PAGE) || 1;
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <Sec id="activity" title="سجل النشاطات — آخر 500 عملية">
      <div className="row" style={{ marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
        <select value={filter} onChange={e => { setFilter(e.target.value); setPage(1); }} className="btn sm ghost" style={{ padding: "6px 12px" }}>
          <option value="all">الكل</option>
          {["login","add","edit","delete","export","import","backup","role","password","email"].map(t => (
            <option key={t} value={t}>{TYPE_LABELS[t]}</option>
          ))}
        </select>
        <span className="mut">إجمالي: {activities.length} — مفلتر: {filtered.length}</span>
      </div>

      {loading ? (
        <p className="mut">جاري التحميل...</p>
      ) : filtered.length ? (
        <>
          <div style={{ overflowX: "auto" }}>
            <table className="tbl"><thead><tr>
              <th>النوع</th><th>الجدول</th><th>العنصر</th><th>المستخدم</th><th>التفاصيل</th><th>IP</th><th>الوقت</th>
            </tr></thead><tbody>
              {paged.map(a => (
                <tr key={a.id}>
                  <td><span style={{ color: TYPE_COLORS[a.type], fontWeight: 700 }}>{TYPE_LABELS[a.type] || a.type}</span></td>
                  <td><code>{a.table}</code></td>
                  <td>{a.itemTitle}</td>
                  <td dir="ltr">{a.userEmail} <span className="mut">({a.userRole})</span></td>
                  <td className="mut" style={{ maxWidth: 300 }}>{a.details || "-"}</td>
                  <td className="mut" dir="ltr">{a.ip || "-"}</td>
                  <td className="mut" dir="ltr">{new Date(a.createdAt).toLocaleString("ar-EG")}</td>
                </tr>
              ))}
            </tbody></table>
          </div>
          {totalPages > 1 && (
            <nav className="pagination" style={{ marginTop: 12 }}>
              {page > 1 && <button className="btn sm ghost" onClick={() => setPage(p => p - 1)}>السابق</button>}
              <span className="page-info">صفحة {page} من {totalPages}</span>
              {page < totalPages && <button className="btn sm ghost" onClick={() => setPage(p => p + 1)}>التالي</button>}
            </nav>
          )}
        </>
      ) : (
        <p className="mut">لا توجد نشاطات تطابق الفلتر.</p>
      )}
    </Sec>
  );
}