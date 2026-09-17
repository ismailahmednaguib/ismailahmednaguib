// components/TeacherDashboard.tsx : لوحة تحكم المعلم
"use client";
import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import ReviewStars from "./ReviewStars";

interface Course {
  slug: string;
  title: string;
  track: string;
  published: boolean;
  studentsCount: number;
  avgRating: number;
  totalReviews: number;
}

interface Student {
  id: string;
  email: string;
  name: string;
  enrolledAt: string;
  progress: number;
  completedLessons: number;
  totalLessons: number;
}

export default function TeacherDashboard({ locale, userEmail }: { locale: string; userEmail: string }) {
  const t = useTranslations("teacher");
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "courses" | "students" | "analytics">("overview");
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    totalRevenue: 0,
    avgRating: 0,
  });

  useEffect(() => {
    fetchDashboardData();
  }, [locale, userEmail]);

  async function fetchDashboardData() {
    setLoading(true);
    try {
      // جلب كورسات المعلم
      const coursesRes = await fetch(`/${locale}/api/teacher/courses`);
      const coursesData = await coursesRes.json();
      if (coursesData.ok) {
        setCourses(coursesData.courses || []);
        setStats(prev => ({
          ...prev,
          totalCourses: coursesData.courses?.length || 0,
          totalStudents: coursesData.courses?.reduce((sum: number, c: Course) => sum + c.studentsCount, 0) || 0,
          avgRating: coursesData.courses?.length 
            ? coursesData.courses.reduce((sum: number, c: Course) => sum + c.avgRating, 0) / coursesData.courses.length 
            : 0,
        }));
      }
    } catch {
      // تجاهل الخطأ
    } finally {
      setLoading(false);
    }
  }

  async function fetchCourseStudents(courseSlug: string) {
    try {
      const res = await fetch(`/${locale}/api/teacher/courses/${courseSlug}/students`);
      const data = await res.json();
      if (data.ok) {
        setStudents(data.students || []);
      }
    } catch {
      // تجاهل الخطأ
    }
  }

  function handleCourseSelect(course: Course) {
    setSelectedCourse(course);
    setActiveTab("students");
    fetchCourseStudents(course.slug);
  }

  if (loading) return <div className="teacher-loading">{t("loading")}</div>;

  return (
    <div className="teacher-dashboard">
      <aside className="teacher-sidebar">
        <div className="teacher-profile">
          <div className="avatar">👨‍🏫</div>
          <h3>{t("teacherPortal")}</h3>
          <p className="email">{userEmail}</p>
        </div>
        <nav className="teacher-nav">
          <button 
            className={`nav-item ${activeTab === "overview" ? "active" : ""}`}
            onClick={() => { setActiveTab("overview"); setSelectedCourse(null); }}
          >
            📊 {t("overview")}
          </button>
          <button 
            className={`nav-item ${activeTab === "courses" ? "active" : ""}`}
            onClick={() => { setActiveTab("courses"); setSelectedCourse(null); }}
          >
            📚 {t("myCourses")}
          </button>
          <button 
            className={`nav-item ${activeTab === "students" ? "active" : ""}`}
            onClick={() => { setActiveTab("students"); }}
            disabled={!selectedCourse}
          >
            👥 {t("myStudents")}
          </button>
          <button 
            className={`nav-item ${activeTab === "analytics" ? "active" : ""}`}
            onClick={() => { setActiveTab("analytics"); setSelectedCourse(null); }}
          >
            📈 {t("analytics")}
          </button>
        </nav>
        <Link href={`/${locale}/dashboard`} className="btn block mt-4">{t("adminDashboard")}</Link>
        <a href={`/${locale}/api/logout`} className="btn ghost block mt-2">{t("logout")}</a>
      </aside>

      <main className="teacher-main">
        <header className="teacher-header">
          <h1>{activeTab === "overview" ? t("overview") : activeTab === "courses" ? t("myCourses") : activeTab === "students" ? t("myStudents") : t("analytics")}</h1>
        </header>

        {activeTab === "overview" && (
          <div className="dashboard-grid">
            <div className="stat-card">
              <div className="stat-icon">📚</div>
              <div className="stat-info">
                <div className="stat-value">{stats.totalCourses}</div>
                <div className="stat-label">{t("totalCourses")}</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-info">
                <div className="stat-value">{stats.totalStudents}</div>
                <div className="stat-label">{t("totalStudents")}</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">⭐</div>
              <div className="stat-info">
                <div className="stat-value">{stats.avgRating.toFixed(1)}</div>
                <div className="stat-label">{t("avgRating")}</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">💰</div>
              <div className="stat-info">
                <div className="stat-value">{stats.totalRevenue.toLocaleString()}</div>
                <div className="stat-label">{t("totalRevenue")}</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "courses" && (
          <div className="courses-list">
            <div className="list-header">
              <h2>{t("myCourses")}</h2>
              <Link href={`/${locale}/dashboard`} className="btn gold">
                {t("createCourse")}
              </Link>
            </div>
            {courses.length === 0 ? (
              <p className="mut">{t("noCourses")}</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>{t("course")}</th>
                    <th>{t("track")}</th>
                    <th>{t("students")}</th>
                    <th>{t("rating")}</th>
                    <th>{t("reviews")}</th>
                    <th>{t("status")}</th>
                    <th>{t("actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map((course) => (
                    <tr key={course.slug}>
                      <td>
                        <strong>{course.title}</strong>
                        <br /><small>{course.slug}</small>
                      </td>
                      <td>{course.track}</td>
                      <td>{course.studentsCount}</td>
                      <td><ReviewStars rating={course.avgRating} size="sm" showValue /></td>
                      <td>{course.totalReviews}</td>
                      <td>
                        <span className={`badge ${course.published ? "published" : "draft"}`}>
                          {course.published ? t("published") : t("draft")}
                        </span>
                      </td>
                      <td>
                        <button className="btn sm" onClick={() => handleCourseSelect(course)}>
                          {t("viewStudents")}
                        </button>
                        <Link href={`/${locale}/dashboard/courses/${course.slug}`} className="btn sm ghost">
                          {t("edit")}
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === "students" && selectedCourse && (
          <div className="students-list">
            <div className="list-header">
              <h2>{t("studentsIn")} {selectedCourse.title}</h2>
              <span className="count">{students.length} {t("students")}</span>
            </div>
            {students.length === 0 ? (
              <p className="mut">{t("noStudents")}</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>{t("student")}</th>
                    <th>{t("enrolledAt")}</th>
                    <th>{t("progress")}</th>
                    <th>{t("completedLessons")}</th>
                    <th>{t("totalLessons")}</th>
                    <th>{t("actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student.id}>
                      <td>
                        <strong>{student.name || student.email}</strong>
                        <br /><small>{student.email}</small>
                      </td>
                      <td>{new Date(student.enrolledAt).toLocaleDateString(locale === "ar" ? "ar-SA" : "en-US")}</td>
                      <td>
                        <div className="progress-mini">
                          <div className="progress-bar-mini">
                            <div className="progress-fill-mini" style={{ width: `${student.progress}%` }} />
                          </div>
                          <span>{student.progress}%</span>
                        </div>
                      </td>
                      <td>{student.completedLessons}</td>
                      <td>{student.totalLessons}</td>
                      <td>
                        <Link href={`/${locale}/teacher/students/${student.id}`} className="btn sm">
                          {t("viewDetails")}
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === "analytics" && (
          <div className="analytics-view">
            <h2>{t("analytics")}</h2>
            <div className="analytics-grid">
              <div className="analytics-card">
                <h3>{t("enrollmentTrend")}</h3>
                <div className="chart-placeholder">{t("chartComingSoon")}</div>
              </div>
              <div className="analytics-card">
                <h3>{t("completionRate")}</h3>
                <div className="chart-placeholder">{t("chartComingSoon")}</div>
              </div>
              <div className="analytics-card">
                <h3>{t("revenueChart")}</h3>
                <div className="chart-placeholder">{t("chartComingSoon")}</div>
              </div>
              <div className="analytics-card">
                <h3>{t("ratingDistribution")}</h3>
                <div className="chart-placeholder">{t("chartComingSoon")}</div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}