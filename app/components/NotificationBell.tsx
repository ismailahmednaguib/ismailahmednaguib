// components/NotificationBell.tsx : جرس الإشعارات في الهيدر
"use client";
import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  read: boolean;
  created_at: string;
}

const typeIcons: Record<string, string> = {
  info: "ℹ️",
  success: "✅",
  warning: "⚠️",
  error: "❌",
  new_lesson: "🎓",
  new_certificate: "📜",
  enrollment: "📝",
  announcement: "📢",
  grade_released: "📊",
};

export default function NotificationBell({ locale }: { locale: string }) {
  const t = useTranslations("notifications");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, [locale]);

  async function fetchNotifications() {
    try {
      const res = await fetch(`/${locale}/api/notifications?limit=20`);
      const data = await res.json();
      if (data.ok) {
        setNotifications(data.notifications || []);
        setUnreadCount((data.notifications || []).filter((n: Notification) => !n.read).length);
      }
    } catch {
      // تجاهل الخطأ
    } finally {
      setLoading(false);
    }
  }

  async function markAsRead(id: string) {
    try {
      await fetch(`/${locale}/api/notifications`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, read: true }),
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      // تجاهل الخطأ
    }
  }

  async function markAllAsRead() {
    try {
      await fetch(`/${locale}/api/notifications`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: "all", read: true }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch {
      // تجاهل الخطأ
    }
  }

  async function deleteNotification(id: string) {
    try {
      await fetch(`/${locale}/api/notifications?id=${id}`, { method: "DELETE" });
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      const notif = notifications.find((n) => n.id === id);
      if (notif && !notif.read) setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      // تجاهل الخطأ
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(locale === "ar" ? "ar-SA" : "en-US", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) return <div className="notification-bell loading" aria-label={t("title")}>⏳</div>;

  return (
    <div className="notification-bell-wrapper">
      <button
        className={`notification-bell ${unreadCount > 0 ? "has-unread" : ""}`}
        onClick={() => setOpen(!open)}
        aria-label={`${t("title")} (${unreadCount} ${t("unread")})`}
        aria-expanded={open}
      >
        🔔
        {unreadCount > 0 && <span className="notification-badge">{unreadCount > 9 ? "9+" : unreadCount}</span>}
      </button>

      {open && (
        <div className="notification-dropdown" role="menu">
          <div className="notification-header">
            <h4>{t("title")}</h4>
            {unreadCount > 0 && (
              <button className="btn sm ghost" onClick={markAllAsRead}>{t("markAllRead")}</button>
            )}
          </div>
          <div className="notification-list">
            {notifications.length > 0 ? (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`notification-item ${!n.read ? "unread" : ""}`}
                  role="menuitem"
                >
                  <span className="notification-icon">{typeIcons[n.type] || "🔔"}</span>
                  <div className="notification-content">
                    <div className="notification-title">{n.title}</div>
                    {n.message && <div className="notification-message">{n.message}</div>}
                    <div className="notification-time">{formatDate(n.created_at)}</div>
                  </div>
                  <div className="notification-actions">
                    {n.link && (
                      <Link
                        href={n.link}
                        className="btn sm"
                        onClick={() => setOpen(false)}
                      >
                        {t("view")}
                      </Link>
                    )}
                    {!n.read && (
                      <button
                        className="btn sm ghost"
                        onClick={() => markAsRead(n.id)}
                        aria-label={t("markRead")}
                      >
                        ✓
                      </button>
                    )}
                    <button
                      className="btn sm ghost"
                      onClick={() => deleteNotification(n.id)}
                      aria-label={t("delete")}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="notification-empty">{t("noNotifications")}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}