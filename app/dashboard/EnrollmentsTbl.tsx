// app/dashboard/EnrollmentsTbl.tsx : إدارة تسجيلات الطلاب
"use client";
import { useState, useEffect } from "react";
import { Sec } from "./ui";
import DeleteBtn from "./DeleteBtn";
import type { Enrollment } from "@/lib/enrollment";
import type { Course } from "@/lib/types";

interface Props {
  courses: Course[];
}

export default function EnrollmentsTbl({ courses }: Props) {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCourse, setFilterCourse] = useState("all");
  const [filterStudent, setFilterStudent] = useState("");
  const [page, setPage] = useState(1);
  const PER_PAGE = 20;

  useEffect(() => {
    fetch("/api/admin/enrollments").then(r => r.json()).then(d => {
      if (d.ok) setEnrollments(d.enrollments || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filtered = enrollments.filter(e => {
    const courseMatch = filterCourse === "all" || e.courseSlug === filterCourse;
    const studentMatch = !filterStudent || e.studentEmail.toLowerCase().includes(filterStudent.toLowerCase());
    return courseMatch && studentMatch;
  });

  const totalPages = Math.ceil(filtered.length / PER_PAGE) || 1;
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const getCourseTitle = (slug: string) => courses.find(c => c.slug === slug)?.title || slug;

  const handleDelete = async (id: string) => {
    if (!confirm("حذف هذا التسجيل؟")) return;
    const res = await fetch(`/api/admin/enrollments?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    if (res.ok) {
      setEnrollments(prev => prev.filter(e => e.id !== id));
    } else {
      alert("فشل الحذف");
    }
  };

  if (loading) return <Sec id="enrollments" title="إدارة التسجيلات"><p className="mut">جاري التحميل...</p></Sec>;

  return (
    <Sec id="enrollments" title="إدارة تسجيلات الطلاب">
      <div className="row" style={{ marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
        <select value={filterCourse} onChange={e => { setFilterCourse(e.target.value); setPage(1); }} className="btn sm ghost" style={{ padding: "6px 12px" }}>
          <option value="all">كل الدورات</option>
          {courses.map(c => <option key={c.slug} value={c.slug}>{c.title}</option>)}
        </select>
        <input type="text" placeholder="بحث بالبريد..." value={filterStudent} onChange={e => { setFilterStudent(e.target.value); setPage(1); }} className="btn sm ghost" style={{ padding: "6px 12px", maxWidth: 300 }} />
        <span className="mut">إجمالي: {enrollments.length} — مفلتر: {filtered.length}</span>
      </div>

      {filtered.length ? (
        <>
          <div style={{ overflowX: "auto" }}>
            <table className="tbl"><thead><tr>
              <th>الطالب</th><th>الدورة</th><th>التاريخ</th><th>التقدم</th><th>مكتمل</th><th>شهادة</th><th>آخر دخول</th><th>حذف</th>
            </tr></thead><tbody>
              {paged.map(e => (
                <tr key={e.id}>
                  <td dir="ltr">{e.studentEmail}</td>
                  <td>{getCourseTitle(e.courseSlug)}</td>
                  <td className="mut">{new Date(e.enrolledAt).toLocaleDateString("ar-EG")}</td>
                  <td>
                    <div style={{ height: 8, background: "var(--br)", borderRadius: 4, width: 120, overflow: "hidden" }}>
                      <div style={{ width: `${e.progress}%`, height: "100%", background: "linear-gradient(90deg,var(--g),var(--g2))" }}></div>
                    </div>
                    <small className="mut">{e.progress}%</small>
                  </td>
                  <td className="mut">{e.completedLessons.length} درس</td>
                  <td>{e.certificateIssued ? "✅" : "❌"}</td>
                  <td className="mut">{e.lastAccessedAt ? new Date(e.lastAccessedAt).toLocaleString("ar-EG") : "—"}</td>
                  <td><DeleteBtn table="enrollments" id={e.id} /></td>
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
        <p className="mut">لا توجد تسجيلات تطابق الفلتر.</p>
      )}
    </Sec>
  );
}