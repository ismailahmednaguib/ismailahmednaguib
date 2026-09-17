// components/ForumTopicList.tsx : قائمة مواضيع المنتدى
"use client";
import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";

interface Topic {
  id: string;
  forum_id: string;
  user_id: string;
  title: string;
  content: string;
  is_pinned: boolean;
  is_locked: boolean;
  is_resolved: boolean;
  view_count: number;
  reply_count: number;
  last_reply_at: string | null;
  last_reply_by: string | null;
  created_at: string;
  updated_at: string;
  user?: { email: string };
  last_reply_user?: { email: string };
}

interface ForumTopicListProps {
  locale: string;
  forumId: string;
  onTopicSelect?: (topic: Topic) => void;
}

export default function ForumTopicList({ locale, forumId, onTopicSelect }: ForumTopicListProps) {
  const t = useTranslations("forums");
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [showCreate, setShowCreate] = useState(false);
  const [formData, setFormData] = useState({ title: "", content: "" });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchTopics();
  }, [locale, forumId, pagination.page]);

  const fetchTopics = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", pagination.page.toString());
      params.set("limit", pagination.limit.toString());
      const res = await fetch(`/${locale}/api/forums/${forumId}/topics?${params}`);
      const data = await res.json();
      if (data.ok) {
        setTopics(data.topics || []);
        setPagination(prev => ({ ...prev, total: data.pagination?.total || 0, totalPages: data.pagination?.totalPages || 0 }));
      } else setError(data.error);
    } catch {
      setError(t("networkError"));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) return;
    setCreating(true);
    try {
      const res = await fetch(`/${locale}/api/forums/${forumId}/topics`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.ok) {
        setShowCreate(false);
        setFormData({ title: "", content: "" });
        fetchTopics();
      } else {
        alert(data.error || t("createError"));
      }
    } catch {
      alert(t("networkError"));
    } finally {
      setCreating(false);
    }
  };

  if (loading) return <div className="topic-loading">{t("loading")}</div>;
  if (error) return <div className="topic-error">{error}</div>;

  return (
    <div className="topic-list">
      <div className="topic-list-header">
        <h2>{t("topics")}</h2>
        <button className="btn gold" onClick={() => setShowCreate(true)}>
          {t("newTopic")}
        </button>
      </div>

      {showCreate && (
        <div className="panel create-topic-form">
          <h3>{t("newTopic")}</h3>
          <form onSubmit={handleCreateTopic}>
            <div className="form-row">
              <label>{t("title")} *</label>
              <input
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder={t("titlePlaceholder")}
                required
              />
            </div>
            <div className="form-row">
              <label>{t("content")} *</label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({...formData, content: e.target.value})}
                rows={5}
                placeholder={t("contentPlaceholder")}
                required
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn gold" disabled={creating}>
                {creating ? t("creating") : t("create")}
              </button>
              <button type="button" className="btn ghost" onClick={() => { setShowCreate(false); setFormData({ title: "", content: "" }); }}>
                {t("cancel")}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="topics-table">
        {topics.length === 0 ? (
          <p className="mut">{t("noTopics")}</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>{t("topic")}</th>
                <th>{t("replies")}</th>
                <th>{t("views")}</th>
                <th>{t("lastReply")}</th>
              </tr>
            </thead>
            <tbody>
              {topics.map((topic) => (
                <tr key={topic.id} className={topic.is_pinned ? "pinned" : ""} onClick={() => onTopicSelect?.(topic)}>
                  <td className="topic-title-cell">
                    {topic.is_pinned && <span className="pin-icon" title={t("pinned")}>📌</span>}
                    {topic.is_locked && <span className="lock-icon" title={t("locked")}>🔒</span>}
                    {topic.is_resolved && <span className="resolved-badge">{t("resolved")}</span>}
                    <strong>{topic.title}</strong>
                    <div className="topic-meta">
                      <span>{t("by")} {topic.user?.email || t("unknown")}</span>
                      <span>{t("at")} {new Date(topic.created_at).toLocaleDateString(locale === "ar" ? "ar-SA" : "en-US")}</span>
                    </div>
                  </td>
                  <td>{topic.reply_count}</td>
                  <td>{topic.view_count}</td>
                  <td>
                    {topic.last_reply_at ? (
                      <>
                        {t("by")} {topic.last_reply_user?.email || t("unknown")}<br/>
                        {new Date(topic.last_reply_at).toLocaleString(locale === "ar" ? "ar-SA" : "en-US")}
                      </>
                    ) : (
                      <span className="mut">{t("noReplies")}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {pagination.totalPages > 1 && (
        <nav className="pagination">
          <button className="btn sm ghost" onClick={() => setPagination(p => ({...p, page: p.page - 1}))} disabled={pagination.page <= 1}>
            {t("previous")}
          </button>
          <span>{pagination.page} / {pagination.totalPages}</span>
          <button className="btn sm ghost" onClick={() => setPagination(p => ({...p, page: p.page + 1}))} disabled={pagination.page >= pagination.totalPages}>
            {t("next")}
          </button>
        </nav>
      )}
    </div>
  );
}