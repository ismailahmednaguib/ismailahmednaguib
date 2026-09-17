// app/dashboard/EditTables.tsx : جداول اللوحة مع التعديل والحذف — كل جدول في مكون مستقل
"use client";
import { useState } from "react";
import DeleteBtn from "./DeleteBtn";
import EditRow, { type EditField } from "./EditRow";
import BulkActions from "./BulkActions";
import type { DashboardRow } from "./ui";

function RowTbl({ rows, cols, table, fields }: { rows: DashboardRow[]; cols: string[]; table: string; fields: EditField[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showBulk, setShowBulk] = useState(false);

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

  const handleBulkComplete = () => {
    window.location.reload();
  };

  if (!rows.length) return <p className="mut">لا بيانات بعد.</p>;

  return (
    <>
      <div className="row" style={{ marginBottom: 8, justifyContent: "space-between", alignItems: "center" }}>
        <label className="row" style={{ gap: 8, cursor: "pointer" }}>
          <input type="checkbox" checked={selected.size === rows.length && rows.length > 0} onChange={toggleAll} />
          <span>تحديد الكل ({rows.length})</span>
        </label>
        <button className="btn sm ghost" onClick={() => setShowBulk(!showBulk)}>
          {showBulk ? "إخفاء الإجراءات المجمعة" : `إجراءات مجمعة (${selected.size})`}
        </button>
      </div>
      <div style={{ overflowX: "auto" }}><table className="tbl"><thead><tr>
        <th style={{ width: 40 }}><input type="checkbox" checked={selected.size === rows.length && rows.length > 0} onChange={toggleAll} aria-label="تحديد الكل" /></th>
        {cols.map((c) => (<th key={c}>{c}</th>))}<th>نشر</th><th>تعديل</th><th>حذف</th>
      </tr></thead><tbody>
        {rows.map((r, i) => {
          const id = String(r.id || r.slug || r.code || i);
          const published = r.published === true || r.published === "true";
          return (
            <tr key={id}>
              <td><input type="checkbox" checked={selected.has(id)} onChange={() => toggle(id)} /></td>
              {cols.map((c) => (<td key={c}>{String(r[c] ?? "")}</td>))}
              <td style={{ textAlign: "center" }}>
                <input type="checkbox" checked={published} onChange={async (e) => {
                  const res = await fetch(`/api/admin/${table}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id, published: e.target.checked }),
                  });
                  if (!res.ok) window.location.reload();
                }} />
              </td>
              <td><EditRow table={table} row={r} fields={fields} /></td>
              <td><DeleteBtn table={table} id={id} /></td>
            </tr>
          );
        })}
      </tbody></table></div>
      {showBulk && <BulkActions table={table} rows={rows} onComplete={handleBulkComplete} />}
    </>
  );
}

const TRACKS = ["academy", "institute", "quran", "college"];

export function CoursesTbl({ rows }: { rows: DashboardRow[] }) {
  return <RowTbl rows={rows} cols={["slug", "title", "track", "teacher", "price", "category", "order"]} table="courses" fields={[
    { name: "slug", label: "slug (ثابت)", readonly: true },
    { name: "title", label: "اسم الدورة" },
    { name: "track", label: "المسار", type: "select", options: TRACKS },
    { name: "teacher", label: "المدرس" },
    { name: "level", label: "المستوى" },
    { name: "hours", label: "الساعات", type: "number" },
    { name: "price", label: "السعر", type: "number" },
    { name: "category", label: "التصنيف" },
    { name: "tags", label: "الوسوم (مفصولة بفاصلة)" },
    { name: "videoUrl", label: "رابط الفيديو" },
    { name: "desc", label: "الوصف", type: "textarea" },
    { name: "published", label: "منشور", type: "checkbox" },
    { name: "order", label: "الترتيب", type: "number" },
  ]} />;
}

export function LessonsTbl({ rows }: { rows: DashboardRow[] }) {
  return <RowTbl rows={rows} cols={["courseSlug", "title", "duration", "order"]} table="lessons" fields={[
    { name: "id", label: "المعرف (ثابت)", readonly: true },
    { name: "courseSlug", label: "slug الدورة" },
    { name: "title", label: "عنوان الدرس" },
    { name: "videoUrl", label: "رابط الفيديو" },
    { name: "duration", label: "المدة" },
    { name: "order", label: "الترتيب", type: "number" },
  ]} />;
}

export function BooksTbl({ rows }: { rows: DashboardRow[] }) {
  return <RowTbl rows={rows} cols={["slug", "title", "author", "category", "order"]} table="books" fields={[
    { name: "slug", label: "slug (ثابت)", readonly: true },
    { name: "title", label: "اسم الكتاب" },
    { name: "author", label: "المؤلف" },
    { name: "track", label: "المسار", type: "select", options: TRACKS },
    { name: "pages", label: "الصفحات", type: "number" },
    { name: "category", label: "التصنيف" },
    { name: "tags", label: "الوسوم (مفصولة بفاصلة)" },
    { name: "pdfUrl", label: "رابط PDF" },
    { name: "desc", label: "الوصف", type: "textarea" },
    { name: "published", label: "منشور", type: "checkbox" },
    { name: "order", label: "الترتيب", type: "number" },
  ]} />;
}

export function ScholarsTbl({ rows }: { rows: DashboardRow[] }) {
  return <RowTbl rows={rows} cols={["slug", "name", "title", "order"]} table="scholars" fields={[
    { name: "slug", label: "slug (ثابت)", readonly: true },
    { name: "name", label: "الاسم" },
    { name: "title", label: "الصفة" },
    { name: "bio", label: "النبذة", type: "textarea" },
    { name: "published", label: "منشور", type: "checkbox" },
    { name: "order", label: "الترتيب", type: "number" },
  ]} />;
}

export function NewsTbl({ rows }: { rows: DashboardRow[] }) {
  return <RowTbl rows={rows} cols={["slug", "title", "date", "order"]} table="news" fields={[
    { name: "slug", label: "slug (ثابت)", readonly: true },
    { name: "title", label: "العنوان" },
    { name: "date", label: "التاريخ" },
    { name: "body", label: "النص", type: "textarea" },
    { name: "published", label: "منشور", type: "checkbox" },
    { name: "order", label: "الترتيب", type: "number" },
  ]} />;
}

export function FatwasTbl({ rows }: { rows: DashboardRow[] }) {
  return <RowTbl rows={rows} cols={["q", "scholar", "order"]} table="fatwas" fields={[
    { name: "q", label: "السؤال", type: "textarea" },
    { name: "a", label: "الجواب", type: "textarea" },
    { name: "scholar", label: "الشيخ" },
    { name: "published", label: "منشور", type: "checkbox" },
    { name: "order", label: "الترتيب", type: "number" },
  ]} />;
}

export function CertsTbl({ rows }: { rows: DashboardRow[] }) {
  return <RowTbl rows={rows} cols={["code", "student", "course", "grade"]} table="certificates" fields={[
    { name: "code", label: "الرقم (ثابت)", readonly: true },
    { name: "student", label: "اسم الطالب" },
    { name: "course", label: "الدورة" },
    { name: "grade", label: "التقدير" },
    { name: "date", label: "التاريخ" },
  ]} />;
}