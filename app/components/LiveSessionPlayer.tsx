"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useTranslations } from "next-intl";

interface SessionData {
  id: string;
  title: string;
  provider: string;
  meeting_id: string;
  meeting_password: string | null;
  scheduled_at: string;
  duration: number;
  joinUrl: string;
  status: string;
  description: string;
}

interface Participant {
  id: string;
  user_id: string;
  joined_at: string | null;
  left_at: string | null;
  duration: number | null;
  role: string;
  user: { email: string };
}

export default function LiveSessionPlayer() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const sessionId = params.id as string;
  const t = useTranslations("liveSession");
  const [session, setSession] = useState<SessionData | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [joined, setJoined] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isHost, setIsHost] = useState(false);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await fetch(`/${locale}/api/live-sessions?id=${sessionId}`);
        const data = await res.json();
        if (!data.ok) throw new Error(data.error || "Failed to load session");
        setSession(data.session);
        setParticipants(data.participants || []);
        setIsHost(data.userParticipant?.role === "host" || data.session.host_email === data.userParticipant?.user?.email);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };
    fetchSession();
  }, [locale, sessionId]);

  const handleJoin = async () => {
    if (!session) return;
    try {
      const res = await fetch(`/${locale}/api/live-sessions/${sessionId}/join`, {
        method: "POST",
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Failed to join");
      setJoined(true);
      if (data.joinUrl) {
        window.open(data.joinUrl, "_blank", "noopener,noreferrer");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to join");
    }
  };

  const handleLeave = async () => {
    try {
      await fetch(`/${locale}/api/live-sessions/${sessionId}/join`, {
        method: "DELETE",
      });
      setJoined(false);
    } catch (err) {
      console.error("Failed to leave:", err);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString(locale === "ar" ? "ar-SA" : "en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  if (loading) {
    return (
      <div className="live-session-player">
        <div className="loading-spinner" role="status" aria-label={t("loading")}>
          <span className="spinner"></span>
          <p>{t("loading")}</p>
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="live-session-player error">
        <h2>{t("sessionNotFound")}</h2>
        <p>{error || t("sessionNotFound")}</p>
        <button onClick={() => router.push(`/${locale}/live`)} className="btn-primary">
          {t("backToSessions")}
        </button>
      </div>
    );
  }

  const isLive = new Date(session.scheduled_at) <= new Date() && session.provider !== "custom";
  const canJoin = isLive || isHost;

  return (
    <div className="live-session-player">
      <div className="session-header">
        <h1>{session.title}</h1>
        <div className="session-meta">
          <span className={`status-badge ${session.status}`}>{t(`status.${session.status}`)}</span>
          <span className="provider-badge">{session.provider.toUpperCase()}</span>
        </div>
      </div>

      <div className="session-details">
        <div className="detail-item">
          <strong>{t("scheduledAt")}:</strong> {formatDate(session.scheduled_at)}
        </div>
        <div className="detail-item">
          <strong>{t("duration")}:</strong> {session.duration} {t("minutes")}
        </div>
        {session.meeting_password && (
          <div className="detail-item">
            <strong>{t("password")}:</strong> <code>{session.meeting_password}</code>
          </div>
        )}
        {session.description && (
          <div className="session-description">
            <strong>{t("description")}:</strong>
            <p>{session.description}</p>
          </div>
        )}
      </div>

      <div className="session-actions">
        {!joined && canJoin && (
          <button onClick={handleJoin} className="btn-primary btn-lg" disabled={loading}>
            {t("joinSession")}
          </button>
        )}
        {joined && (
          <button onClick={handleLeave} className="btn-secondary btn-lg">
            {t("leaveSession")}
          </button>
        )}
        {!canJoin && !joined && (
          <p className="not-available">{t("sessionNotAvailable")}</p>
        )}
        {joined && session.joinUrl && (
          <a 
            href={session.joinUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="btn-outline"
          >
            {t("openInNewTab")}
          </a>
        )}
      </div>

      <div className="participants-section">
        <h3>{t("participants")} ({participants.length})</h3>
        <div className="participants-list">
          {participants.map((p) => (
            <div key={p.id} className={`participant ${p.role}`}>
              <span className="participant-name">{p.user.email}</span>
              <span className="participant-role">{t(`role.${p.role}`)}</span>
              {p.joined_at && (
                <span className="participant-time">
                  {t("joined")}: {new Date(p.joined_at).toLocaleTimeString()}
                </span>
              )}
              {p.left_at && (
                <span className="participant-time">
                  {t("left")}: {new Date(p.left_at).toLocaleTimeString()}
                </span>
              )}
              {p.duration && (
                <span className="participant-duration">
                  {t("duration")}: {Math.round(p.duration / 60)} {t("minutes")}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .live-session-player {
          max-width: 800px;
          margin: 0 auto;
          padding: 2rem;
        }
        .loading-spinner {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3rem;
          gap: 1rem;
        }
        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid var(--border-color);
          border-top-color: var(--primary-color);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .error {
          text-align: center;
          padding: 3rem;
        }
        .session-header {
          margin-bottom: 1.5rem;
        }
        .session-header h1 {
          margin: 0 0 0.5rem;
          font-size: 2rem;
        }
        .session-meta {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        .status-badge, .provider-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.875rem;
          font-weight: 500;
        }
        .status-badge.scheduled { background: var(--warning-bg); color: var(--warning-text); }
        .status-badge.live { background: var(--success-bg); color: var(--success-text); }
        .status-badge.ended { background: var(--muted-bg); color: var(--muted-text); }
        .status-badge.cancelled { background: var(--error-bg); color: var(--error-text); }
        .provider-badge { background: var(--primary-bg); color: var(--primary-text); }
        .session-details {
          background: var(--card-bg);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          padding: 1.5rem;
          margin-bottom: 1.5rem;
        }
        .detail-item {
          margin-bottom: 0.75rem;
        }
        .detail-item:last-child { margin-bottom: 0; }
        .session-description {
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid var(--border-color);
        }
        .session-actions {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
          align-items: center;
          margin-bottom: 2rem;
        }
        .not-available {
          color: var(--muted-text);
          font-style: italic;
        }
        .participants-section h3 {
          margin-bottom: 1rem;
          font-size: 1.25rem;
        }
        .participants-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .participant {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.75rem 1rem;
          background: var(--card-bg);
          border: 1px solid var(--border-color);
          border-radius: var(--radius);
          flex-wrap: wrap;
        }
        .participant.host { border-color: var(--primary-color); }
        .participant-name { font-weight: 500; }
        .participant-role {
          padding: 0.125rem 0.5rem;
          background: var(--muted-bg);
          border-radius: 9999px;
          font-size: 0.75rem;
          text-transform: capitalize;
        }
        .participant-time, .participant-duration {
          font-size: 0.875rem;
          color: var(--muted-text);
        }
        .btn-primary, .btn-secondary, .btn-outline {
          padding: 0.75rem 1.5rem;
          border-radius: var(--radius);
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
        }
        .btn-lg { padding: 1rem 2rem; font-size: 1.1rem; }
        .btn-primary { background: var(--primary-color); color: white; }
        .btn-primary:hover:not(:disabled) { opacity: 0.9; }
        .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
        .btn-secondary { background: var(--error-bg); color: var(--error-text); }
        .btn-outline {
          background: transparent;
          border: 1px solid var(--border-color);
          color: var(--text-color);
        }
      `}</style>
    </div>
  );
}