// components/ForumList.tsx : قائمة المنتديات
"use client";
import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";

interface Forum {
  id: string;
  course_slug: string;
  lesson_id: string | null;
  title: string;
  description: string;
  is_private: boolean;
  created_at: string;
  updated_at: string;
}

export default function ForumList({ 
  locale, 
  courseSlug,
  lessonId,
  onForumSelect 
}: { 
  locale: string; 
  courseSlug?: string;
  lessonId?: string;
  onForumSelect?: (forum: Forum) => void;
}) {
  const t = useTranslations("forums");
  const [forums, setForums] = useState<Forum[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchForums();
  }, [locale, courseSlug, lessonId]);

  const fetchForums = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (courseSlug) params.set("course", courseSlug);
      if (lessonId) params.set("lesson", lessonId);
      const res = await fetch(`/${locale}/api/forums?${params}`);
      const data = await res.json();
      if (data.ok) setForums(data.forums || []);
      else setError(data.error);
    } catch {
      setError(t("networkError"));
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="forum-loading">{t("loading")}</div>;
  if (error) return <div className="forum-error">{error}</div>;

  return (
    <div className="forum-list">
      {forums.length === 0 ? (
        <div className="forum-empty">
          <p>{t("noForums")}</p>
        </div>
      ) : (
        forums.map((forum) => (
          <article key={forum.id} className="forum-card" onClick={() => onForumSelect?.(forum)}>
            <div className="forum-header">
              <h3>{forum.title}</h3>
              {forum.is_private && <span className="badge private">{t("private")}</span>}
            </div>
            {forum.description && <p className="forum-description">{forum.description}</p>}
            <div className="forum-meta">
              <span>{forum.lesson_id ? `📚 ${forum.lesson_id}` : `📖 ${forum.course_slug}`}</span>
              <span>{new Date(forum.updated_at).toLocaleDateString(locale === "ar" ? "ar-SA" : "en-US")}</span>
            </div>
          </article>
        ))
      )}
    </div>
  );
}