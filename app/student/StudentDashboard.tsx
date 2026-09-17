// app/student/StudentDashboard.tsx : مكون واجهة الطالب
"use client";
import { useState } from "react";
import Link from "next/link";
import { youtubeThumb, youtubeEmbed } from "@/lib/youtube";
import type { Course, Lesson } from "@/lib/types";
import type { Enrollment } from "@/lib/enrollment";

interface MyCourse {
  enrollment: Enrollment;
  course: Course;
  lessons: Lesson[];
}

interface Props {
  user: { email: string; role: string };
  myCourses: MyCourse[];
  settings: Record<string, string> | null;
}

function t(settings: Record<string, string> | null, k: string, fb: string) {
  return settings?.[k] || fb;
}

export default function StudentDashboard({ user, myCourses, settings }: Props) {
  const [activeCourse, setActiveCourse] = useState<MyCourse | null>(null);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [view, setView] = useState<"overview" | "certificates">("overview");

  const totalProgress = myCourses.length
    ? Math.round(myCourses.reduce((sum, m) => sum + m.enrollment.progress, 0) / myCourses.length)
    : 0;
  const completedCourses = myCourses.filter(m => m.enrollment.progress === 100).length;
  
  // الشهادات المصدرة
  const myCertificates = myCourses.filter(m => m.enrollment.certificateIssued).map(m => ({
    code: m.enrollment.certificateCode,
    course: m.course.title,
    date: m.enrollment.lastAccessedAt || new Date().toISOString().slice(0, 10),
  }));

  return (
    <div className="student-wrap">
      <aside className="student-side noprint">
        <div className="student-profile">
          <div className="avatar">👤</div>
          <div className="info">
            <b>{user.email}</b>
            <span className="mut">طالب</span>
          </div>
        </div>
        <nav className="student-nav">
          <button className={!activeCourse && view === "overview" ? "active" : ""} onClick={() => { setActiveCourse(null); setActiveLesson(null); setView("overview"); }}>
            📊 نظرة عامة
          </button>
          <button className={!activeCourse && view === "certificates" ? "active" : ""} onClick={() => { setActiveCourse(null); setActiveLesson(null); setView("certificates"); }}>
            📜 شهاداتي ({myCertificates.length})
          </button>
          {myCourses.map(m => (
            <button key={m.enrollment.id} className={activeCourse?.enrollment.id === m.enrollment.id ? "active" : ""}
              onClick={() => { setActiveCourse(m); setActiveLesson(null); setView("overview"); }}>
              🎓 {m.course.title}
              <span className="progress-badge">{m.enrollment.progress}%</span>
            </button>
          ))}
        </nav>
        <div className="student-stats">
          <div className="stat"><b>{myCourses.length}</b><span>دورة مسجلة</span></div>
          <div className="stat"><b>{completedCourses}</b><span>مكتملة</span></div>
          <div className="stat"><b>{totalProgress}%</b><span>متوسط التقدم</span></div>
        </div>
        <a className="btn sm gold" style={{ width: "100%", textAlign: "center", marginTop: 12 }} href="/courses">تصفح دورات جديدة</a>
        <a className="btn sm ghost" style={{ width: "100%", textAlign: "center", marginTop: 8 }} href="/api/logout">تسجيل خروج</a>
      </aside>

      <div className="student-main">
        {!activeCourse ? (
          view === "overview" ? (
            <section className="panel">
              <h2 style={{ marginTop: 0 }}>مرحباً بك، {user.email.split("@")[0]} 👋</h2>
              <p className="mut">من هنا تتابع تقدمك في الدورات، تشاهد الدروس، وتصدر شهاداتك عند الإكمال.</p>

              <div className="kpis" style={{ marginTop: 16 }}>
                <div className="kpi"><b>{myCourses.length}</b><span>دورات مسجلة</span></div>
                <div className="kpi"><b>{completedCourses}</b><span>دورات مكتملة</span></div>
                <div className="kpi"><b>{totalProgress}%</b><span>التقدم الكلي</span></div>
              </div>

              {myCourses.length ? (
                <div className="grid" style={{ marginTop: 20 }}>
                  {myCourses.map(m => (
                    <div className="card" key={m.enrollment.id} onClick={() => setActiveCourse(m)} style={{ cursor: "pointer" }}>
                      <div className="thumb">{m.course.videoUrl ? <img src={youtubeThumb(m.course.videoUrl!) || ""} alt={m.course.title} loading="lazy" /> : "🎓"}</div>
                      <div className="pad">
                        <span className="badge">{m.course.track} • {m.course.level}</span>
                        <b>{m.course.title}</b>
                        <span className="mut">{m.course.teacher} • {m.course.hours} ساعة</span>
                        <div style={{ marginTop: 8 }}>
                          <div style={{ height: 6, background: "var(--br)", borderRadius: 3, overflow: "hidden" }}>
                            <div style={{ width: `${m.enrollment.progress}%`, height: "100%", background: "linear-gradient(90deg,var(--g),var(--g2))", transition: "width .3s" }}></div>
                          </div>
                          <small className="mut">{m.enrollment.progress}% مكتمل • {m.enrollment.completedLessons.length} درس منتهٍ</small>
                        </div>
                        {m.enrollment.certificateIssued && (
                          <Link className="btn sm gold" style={{ marginTop: 8, display: "inline-block" }}
                            href={`/verify?code=${m.enrollment.certificateCode}`} target="_blank" rel="noreferrer">
                            📜 عرض الشهادة
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="panel" style={{ marginTop: 20, textAlign: "center" }}>
                  <p className="mut">لم تسجل في أي دورة بعد.</p>
                  <Link className="btn gold" href="/courses" style={{ marginTop: 12, display: "inline-block" }}>تصفح الدورات</Link>
                </div>
              )}
            </section>
          ) : (
            <section className="panel">
              <h2 style={{ marginTop: 0 }}>📜 شهاداتي المصدرة ({myCertificates.length})</h2>
              {myCertificates.length ? (
                <div className="grid" style={{ marginTop: 16 }}>
                  {myCertificates.map((cert, i) => (
                    <div key={i} className="card" style={{ textAlign: "center" }}>
                      <div className="pad">
                        <div className="qrcode" style={{ fontSize: 18, marginBottom: 8 }} dir="ltr">{cert.code || "—"}</div>
                        <b>{cert.course}</b>
                        <p className="mut" style={{ margin: "8px 0" }}>تاريخ الإصدار: {cert.date}</p>
                        <Link className="btn sm gold" href={`/verify?code=${encodeURIComponent(cert.code || "")}`} target="_blank" rel="noreferrer">
                          عرض وطباعة
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mut" style={{ textAlign: "center", marginTop: 20 }}>لم تحصل على أي شهادة بعد. أكمل الدورات بنسبة 100% لتحصل على شهادتك.</p>
              )}
            </section>
          )
        ) : (
          <section className="panel">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
              <div>
                <button className="btn sm ghost" onClick={() => { setActiveCourse(null); setActiveLesson(null); }} style={{ marginBottom: 8 }}>← العودة</button>
                <h2 style={{ margin: 0 }}>{activeCourse.course.title}</h2>
                <p className="mut">{activeCourse.course.teacher} • {activeCourse.course.hours} ساعة • {activeCourse.course.track}</p>
              </div>
              <div style={{ textAlign: "end" }}>
                <div style={{ height: 8, background: "var(--br)", borderRadius: 4, width: 200, overflow: "hidden", marginBottom: 4 }}>
                  <div style={{ width: `${activeCourse.enrollment.progress}%`, height: "100%", background: "linear-gradient(90deg,var(--g),var(--g2))" }}></div>
                </div>
                <b>{activeCourse.enrollment.progress}% مكتمل</b>
                {activeCourse.enrollment.certificateIssued && (
                  <Link className="btn sm gold" style={{ marginTop: 8, display: "inline-block" }}
                    href={`/verify?code=${activeCourse.enrollment.certificateCode}`} target="_blank" rel="noreferrer">
                    📜 شهادتك
                  </Link>
                )}
              </div>
            </div>

            {activeCourse.course.videoUrl && (
              <div className="video" style={{ marginBottom: 20 }}>
                <iframe src={youtubeEmbed(activeCourse.course.videoUrl)!} allowFullScreen title={activeCourse.course.title} />
              </div>
            )}

            <h3>الدروس ({activeCourse.lessons.length})</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {activeCourse.lessons.map(lesson => {
                const isCompleted = activeCourse.enrollment.completedLessons.includes(lesson.id);
                const isFree = lesson.free;
                const canWatch = isFree || isCompleted || activeCourse.enrollment.progress > 0;
                const videoUrl = lesson.videoUrl;
                const lessonEmb = videoUrl ? youtubeEmbed(videoUrl) : null;

                return (
                  <div className="lesson" key={lesson.id} style={{
                    opacity: canWatch ? 1 : 0.6,
                    borderColor: isCompleted ? "var(--g2)" : "var(--br)",
                    background: isCompleted ? "#f0fdf4" : "var(--card)"
                  }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 10, flex: 1 }}>
                      <span style={{ fontSize: 18 }}>{isCompleted ? "✅" : "🔘"}</span>
                      <span>{lesson.title}</span>
                      <small className="mut">{lesson.duration}</small>
                      {!isFree && !isCompleted && <span className="badge" style={{ background: "#fff3c4", color: "#6d5405" }}>مغلق</span>}
                    </span>
                    {lessonEmb && canWatch ? (
                      <button className="btn sm" onClick={() => setActiveLesson(lesson)}>
                        {isCompleted ? "إعادة المشاهدة" : "مشاهدة"}
                      </button>
                    ) : !lessonEmb ? (
                      <span className="mut">قريباً</span>
                    ) : (
                      <span className="mut">أكمل الدروس السابقة</span>
                    )}
                  </div>
                );
              })}
            </div>

            {activeLesson && activeLesson.videoUrl && youtubeEmbed(activeLesson.videoUrl) && (
              <div className="panel" style={{ marginTop: 20, position: "relative" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <h4 style={{ margin: 0 }}>{activeLesson.title}</h4>
                  <button className="btn sm ghost" onClick={() => setActiveLesson(null)}>إغلاق</button>
                </div>
                <div className="video">
                  <iframe src={youtubeEmbed(activeLesson.videoUrl)!} allowFullScreen title={activeLesson.title} />
                </div>
                <div className="row" style={{ marginTop: 12, justifyContent: "end" }}>
                  {!activeCourse.enrollment.completedLessons.includes(activeLesson.id) && (
                    <button className="btn gold" onClick={async () => {
                      const res = await fetch("/api/student/progress", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ enrollmentId: activeCourse.enrollment.id, lessonId: activeLesson.id })
                      });
                      if (res.ok) window.location.reload();
                    }}>
                    ✅ تعليم كمكتمل
                  </button>
                  )}
                </div>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}