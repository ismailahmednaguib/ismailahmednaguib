// components/LiveSession.tsx : مكون الجلسة المباشرة
"use client";
import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";

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

interface Participant {
  id: string;
  user_id: string;
  user?: { email: string };
  joined_at: string | null;
  left_at: string | null;
  duration: number | null;
  role: string;
}

export default function LiveSession({ 
  session, 
  locale,
  userEmail,
  isHost
}: { 
  session: Session; 
  locale: string; 
  userEmail: string;
  isHost: boolean;
}) {
  const t = useTranslations("live");
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [joinUrl, setJoinUrl] = useState<string>("");
  const [joining, setJoining] = useState(false);
  const [joined, setJoined] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSessionDetails();
  }, [session.id, locale]);

  async function fetchSessionDetails() {
    setLoading(true);
    try {
      const res = await fetch(`/${locale}/api/live-sessions?id=${session.id}`);
      const data = await res.json();
      if (data.ok) {
        setParticipants(data.participants || []);
        setJoinUrl(data.joinUrl || "");
        setJoined(!!data.userParticipant);
      }
    } catch {
      // تجاهل الخطأ
    } finally {
      setLoading(false);
    }
  }

  async function handleJoin() {
    setJoining(true);
    try {
      const res = await fetch(`/${locale}/api/live-sessions/${session.id}/join`, { method: "POST" });
      const data = await res.json();
      if (data.ok) {
        setJoinUrl(data.joinUrl);
        setJoined(true);
        if (data.joinUrl) {
          window.open(data.joinUrl, "_blank", "width=1024,height=768");
        }
      } else {
        alert(data.error || t("joinError"));
      }
    } catch {
      alert(t("networkError"));
    } finally {
      setJoining(false);
    }
  }

  async function handleLeave() {
    try {
      await fetch(`/${locale}/api/live-sessions/${session.id}/join`, { method: "DELETE" });
      setJoined(false);
    } catch {
      // تجاهل الخطأ
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(locale === "ar" ? "ar-SA" : "en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
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

  const statusInfo = getStatusBadge(session.status);

  if (loading) return <div className="live-loading">{t("loading")}</div>;

  return (
    <div className="live-session">
      <div className="session-header">
        <div className="session-info">
          <h2>{session.title}</h2>
          <div className="session-meta">
            <span className={`session-status ${statusInfo.class}`}>{statusInfo.label}</span>
            <span>📅 {formatDate(session.scheduled_at)}</span>
            <span>⏱️ {session.duration} {t("minutes")}</span>
            <span>👥 {participants.length}/{session.max_participants}</span>
            <span>🔗 {session.provider === "jitsi" ? "Jitsi Meet" : session.provider}</span>
          </div>
          {session.description && <p className="session-desc">{session.description}</p>}
        </div>
        <div className="session-actions">
          {isHost && session.status === "scheduled" && (
            <button className="btn gold" onClick={handleJoin}>
              {t("startSession")}
            </button>
          )}
          {!isHost && session.status === "scheduled" && !joined && (
            <button className="btn gold" onClick={handleJoin} disabled={joining}>
              {joining ? t("joining") : t("joinSession")}
            </button>
          )}
          {joined && (
            <div className="joined-actions">
              {joinUrl && (
                <a href={joinUrl} target="_blank" rel="noopener noreferrer" className="btn">
                  {t("openInNewTab")}
                </a>
              )}
              <button className="btn ghost" onClick={handleLeave}>{t("leaveSession")}</button>
            </div>
          )}
          {session.status === "live" && isHost && (
            <button className="btn danger" onClick={() => updateStatus("ended")}>
              {t("endSession")}
            </button>
          )}
        </div>
      </div>

      {session.description && <div className="session-description">{session.description}</div>}

      <div className="session-details">
        <div className="detail-item">
          <strong>{t("meetingId")}:</strong>
          <code>{session.meeting_id}</code>
        </div>
        {session.meeting_password && (
          <div className="detail-item">
            <strong>{t("password")}:</strong>
            <code>{session.meeting_password}</code>
          </div>
        )}
        <div className="detail-item">
          <strong>{t("course")}:</strong>
          <Link href={`/${locale}/courses/${session.course_slug}`}>{session.course_slug}</Link>
        </div>
        <div className="detail-item">
          <strong>{t("host")}:</strong>
          <span>{session.host_email}</span>
        </div>
      </div>

      <div className="participants-section">
        <h3>{t("participants")} ({participants.length})</h3>
        {participants.length === 0 ? (
          <p className="mut">{t("noParticipants")}</p>
        ) : (
          <div className="participants-list">
            {participants.map((p) => (
              <div key={p.id} className="participant-row">
                <span className="participant-name">
                  {p.user?.email || p.user_id}
                  {p.role === "host" && <span className="host-badge">{t("host")}</span>}
                </span>
                <span className="participant-status">
                  {p.joined_at ? (
                    <>
                      {t("joinedAt")} {new Date(p.joined_at).toLocaleTimeString(locale === "ar" ? "ar-SA" : "en-US")}
                      {p.left_at && ` • ${t("leftAt")} ${new Date(p.left_at).toLocaleTimeString(locale === "ar" ? "ar-SA" : "en-US")}`}
                      {p.duration && ` • ${t("duration")} ${Math.round(p.duration / 60)} ${t("min")}`}
                    </>
                  ) : (
                    <span className="not-joined">{t("notJoined")}</span>
                  )}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {isHost && (
        <div className="host-controls">
          <h3>{t("hostControls")}</h3>
          <div className="control-buttons">
            <button className="btn" onClick={() => updateStatus("live")} disabled={session.status === "live"}>
              {t("goLive")}
            </button>
            <button className="btn" onClick={() => updateStatus("ended")} disabled={session.status === "ended"}>
              {t("endSession")}
            </button>
            <button className="btn danger" onClick={() => updateStatus("cancelled")} disabled={session.status === "cancelled"}>
              {t("cancelSession")}
            </button>
          </div>
        </div>
      )}
    </div>
  );

  async function updateStatus(status: string) {
    try {
      await fetch(`/${locale}/api/live-sessions`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: session.id, status }),
      });
      // تحديث الحالة محلياً
      session.status = status;
      // إعادة تحميل التفاصيل
      fetchSessionDetails();
    } catch {
      alert(t("updateError"));
    }
  }
}