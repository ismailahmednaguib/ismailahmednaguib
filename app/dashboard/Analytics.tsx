// app/dashboard/Analytics.tsx : لوحة التحليلات
"use client";
import { useState, useEffect } from "react";
import { Sec } from "./ui";

interface AnalyticsData {
  totalCourses: number;
  totalBooks: number;
  totalLessons: number;
  totalScholars: number;
  totalNews: number;
  totalFatwas: number;
  totalCertificates: number;
  totalAdmissions: number;
  totalUsers: number;
  totalEnrollments: number;
  completedEnrollments: number;
  pendingAdmissions: number;
  acceptedAdmissions: number;
  rejectedAdmissions: number;
  coursesByTrack: Record<string, number>;
  certificatesByMonth: Record<string, number>;
  enrollmentsByCourse: Array<{ course: string; count: number; completed: number }>;
  recentActivity: number;
}

export default function Analytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/analytics").then(r => r.json()).then(d => {
      if (d.ok) setData(d.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <Sec id="analytics" title="التحليلات والإحصائيات"><p className="mut">جاري التحميل...</p></Sec>;
  if (!data) return <Sec id="analytics" title="التحليلات والإحصائيات"><p className="mut">تعذر تحميل البيانات</p></Sec>;

  const completionRate = data.totalEnrollments ? Math.round((data.completedEnrollments / data.totalEnrollments) * 100) : 0;
  const admissionAcceptanceRate = data.totalAdmissions ? Math.round((data.acceptedAdmissions / data.totalAdmissions) * 100) : 0;

  return (
    <Sec id="analytics" title="📊 التحليلات والإحصائيات الشاملة">
      <div className="kpis" style={{ marginBottom: 20 }}>
        <div className="kpi"><b>{data.totalCourses}</b><span>دورة</span></div>
        <div className="kpi"><b>{data.totalBooks}</b><span>كتاب</span></div>
        <div className="kpi"><b>{data.totalLessons}</b><span>درس</span></div>
        <div className="kpi"><b>{data.totalCertificates}</b><span>شهادة</span></div>
        <div className="kpi"><b>{data.totalEnrollments}</b><span>تسجيل</span></div>
        <div className="kpi"><b>{completionRate}%</b><span>معدل الإكمال</span></div>
        <div className="kpi"><b>{data.totalAdmissions}</b><span>طلب تقديم</span></div>
        <div className="kpi"><b>{admissionAcceptanceRate}%</b><span>معدل القبول</span></div>
      </div>

      <div className="grid" style={{ marginBottom: 20 }}>
        <div className="panel">
          <h4 style={{ marginTop: 0 }}>الدورات حسب المسار</h4>
          {Object.entries(data.coursesByTrack).map(([track, count]) => (
            <div key={track} className="row" style={{ justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--br)" }}>
              <span>{track}</span>
              <b>{count}</b>
            </div>
          ))}
        </div>

        <div className="panel">
          <h4 style={{ marginTop: 0 }}>الشهادات حسب الشهر</h4>
          {Object.entries(data.certificatesByMonth).slice(-12).map(([month, count]) => (
            <div key={month} className="row" style={{ justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--br)" }}>
              <span>{month}</span>
              <b>{count}</b>
            </div>
          ))}
        </div>

        <div className="panel" style={{ gridColumn: "1 / -1" }}>
          <h4 style={{ marginTop: 0 }}>أكثر الدورات تسجيلاً</h4>
          <div style={{ overflowX: "auto" }}>
            <table className="tbl"><thead><tr><th>الدورة</th><th>مسجلين</th><th>مكتملين</th><th>معدل الإكمال</th></tr></thead><tbody>
              {data.enrollmentsByCourse.slice(0, 10).map((e, i) => (
                <tr key={i}>
                  <td>{e.course}</td>
                  <td dir="ltr">{e.count}</td>
                  <td dir="ltr">{e.completed}</td>
                  <td>{e.count ? Math.round((e.completed / e.count) * 100) : 0}%</td>
                </tr>
              ))}
            </tbody></table>
          </div>
        </div>

        <div className="panel" style={{ gridColumn: "1 / -1" }}>
          <h4 style={{ marginTop: 0 }}>حالة التقديمات</h4>
          <div className="row" style={{ gap: 20, flexWrap: "wrap" }}>
            <div className="kpi" style={{ borderColor: "var(--g2)" }}><b>{data.pendingAdmissions}</b><span>قيد المراجعة</span></div>
            <div className="kpi" style={{ borderColor: "#b3261e" }}><b>{data.rejectedAdmissions}</b><span>مرفوضة</span></div>
            <div className="kpi" style={{ borderColor: "var(--gold)" }}><b>{data.acceptedAdmissions}</b><span>مقبولة</span></div>
          </div>
        </div>
      </div>
    </Sec>
  );
}