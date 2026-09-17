// components/ForumTopicPage.tsx : صفحة موضوع المنتدى
"use client";
import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import ForumTopicView from "./ForumTopicView";

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
  posts?: any[];
}

export default function ForumTopicPage({ locale, forumId, topicId, userEmail, userRole }: { locale: string; forumId: string; topicId: string; userEmail: string; userRole: string }) {
  const t = useTranslations("forums");
  const [topic, setTopic] = useState<Topic | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTopic();
  }, [locale, forumId, topicId]);

  const fetchTopic = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/${locale}/api/forums/${forumId}/topics?topicId=${topicId}`);
      const data = await res.json();
      if (data.ok) {
        setTopic(data.topic);
      } else {
        setError(data.error || t("notFound"));
      }
    } catch {
      setError(t("networkError"));
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="topic-loading">{t("loading")}</div>;
  if (error) return <div className="topic-error">{error}</div>;
  if (!topic) return <div className="topic-error">{t("notFound")}</div>;

  return (
    <ForumTopicView 
      locale={locale} 
      forumId={forumId} 
      topic={topic} 
      onBack={() => window.history.back()}
    />
  );
}