// components/LiveSessionsPage.tsx : صفحة قائمة الجلسات المباشرة
"use client";
import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import LiveSession from "./LiveSession";

interface Session {
  id: string;
  title: string;
  description: string;
  provider: string;
  meeting_id: string;
  meeting_password: string | null;
  scheduled_at: string;
  duration: number;
  max_participants: number;
  status: string;
  host_email: string;
  course_slug: string;
}

export default function LiveSessionsPage({ locale, userEmail, userRole }: { locale: string; userEmail: string; userRole: string }) {
  const t = useTranslations("live");
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"upcoming" | "live" | "past" | "hosted">("upcoming");
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);

  useEffect(() => {
    fetchSessions();
  }, [locale, activeTab, userEmail, userRole]);

  async function fetchSessions() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeTab === "upcoming") params.set("upcoming", "true");
      else if (activeTab === "live") params.set("status", "live");
      else if (activeTab === "past") params.set("status", "ended");
      else if (activeTab === "hosted") params.set("status", "scheduled"); // للمضيف
      
      if (userRole !== "admin" && activeTab === "hosted") {
        // للمضيف، نمرر host_email في الاستعلام الفعلي
      }
      
      const res = await fetch(`/${locale}/api/live-sessions?${params}`);
      const data = await res.json();
      if (data.ok) {
        let filtered = data.sessions || [];
        if (activeTab === "hosted" && userRole !== "admin") {
          filtered = filtered.filter((s: Session) => s.host_email === userEmail);
        }
        setSessions(filtered);
      }
    } catch {
      // تجاهل الخطأ
    } finally {
      setLoading(false);
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(locale === "ar" ? "ar-SA" : "en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { label: string; class: string }> = {
      scheduled: { label: t("scheduled"), class: "badge-scheduled" },
      live: { label: t("live"), class: "badge-live" },
      ended: { label: t("ended"), class: "badge-ended" },
      cancelled: { label: t("cancelled"), class: "badge-cancelled" },
    };
    return badges[status] || { label: status, class: "" };
  };

  if (loading) return <div className="live-loading">{t("loading")}</div>;

  return (
    <div className="live-sessions-page">
      <header className="page-header">
        <h1>{t("title")}</h1>
        {userRole !== "student" && (
          <Link href={`/${locale}/live/create`} className="btn gold">
            {t("createSession")}
          </Link>
        )}
      </header>

      <div className="tabs">
        <button className={activeTab === "upcoming" ? "active" : ""} onClick={() => setActiveTab("upcoming")}>
          {t("upcoming")}
        </button>
        <button className={activeTab === "live" ? "active" : ""} onClick={() => setActiveTab("live")}>
          {t("liveNow")}
        </button>
        <button className={activeTab === "past" ? "active" : ""} onClick={() => setActiveTab("past")}>
          {t("past")}
        </button>
        {(userRole === "admin") && (
          <button className={activeTab === "hosted" ? "active" : ""} onClick={() => setActiveTab("hosted")}>
            {t("mySessions")}
          </button>
        )}
      </div>

      {selectedSession ? (
        <div className="session-detail">
          <button className="back-btn" onClick={() => setSelectedSession(null)}>{t("back")}</button>
          <LiveSession 
            session={selectedSession} 
            locale={locale}
            userEmail={userEmail}
            isHost={selectedSession.host_email === userEmail || userRole === "admin"}
          />
        </div>
      ) : (
        <div className="sessions-grid">
          {sessions.length === 0 ? (
            <div className="empty-state">
              <p>{t("noSessions")}</p>
{userRole === "admin" && (
                <Link href={`/${locale}/live/create`} className="btn gold">
                  {t("createFirstSession")}
                </Link>
              )}
            </div>
          ) : (
            sessions.map((session) => {
              const statusInfo = getStatusBadge(session.status);
              return (
                <article key={session.id} className="session-card" onClick={() => setSelectedSession(session)}>
                  <div className="session-card-header">
                    <h3>{session.title}</h3>
                    <span className={`session-status ${statusInfo.class}`}>{statusInfo.label}</span>
                  </div>
                  <div className="session-card-meta">
                    <span>📅 {formatDate(session.scheduled_at)}</span>
                    <span>⏱️ {session.duration} {t("minutes")}</span>
                    <span>🔗 {session.provider === "jitsi" ? "Jitsi" : session.provider}</span>
                    <span>👤 {session.host_email}</span>
                  </div>
                  <div className="session-card-course">
                    <Link href={`/${locale}/courses/${session.course_slug}`}>{session.course_slug}</Link>
                  </div>
                </article>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}