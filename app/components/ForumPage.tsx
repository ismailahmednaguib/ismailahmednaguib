// components/ForumPage.tsx : صفحة المنتدى الرئيسية
"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import ForumList from "./ForumList";
import ForumTopicList from "./ForumTopicList";
import ForumTopicView from "./ForumTopicView";

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

export default function ForumPage({ locale, forumId, userEmail, userRole }: { locale: string; forumId: string; userEmail: string; userRole: string }) {
  const t = useTranslations("forums");
  const [selectedForum, setSelectedForum] = useState<Forum | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [view, setView] = useState<"list" | "topics" | "topic">(forumId ? "topics" : "list");

  // إذا تم تمرير forumId مباشرة، نجلب المنتدى
  useEffect(() => {
    if (forumId && !selectedForum) {
      // سنجلب المنتدى من API
    }
  }, [forumId, locale]);

  return (
    <div className="forum-page">
      <div className="forum-layout">
        <aside className="forum-sidebar">
          {view === "list" && (
            <ForumList 
              locale={locale} 
              onForumSelect={(forum) => {
                setSelectedForum(forum);
                setView("topics");
              }}
            />
          )}
          {view === "topics" && selectedForum && (
            <div>
              <button className="btn ghost block mb-4" onClick={() => { setView("list"); setSelectedForum(null); }}>
                ← {t("backToForums")}
              </button>
              <h3>{selectedForum.title}</h3>
              <ForumTopicList 
                locale={locale} 
                forumId={selectedForum.id}
                onTopicSelect={(topic) => {
                  setSelectedTopic(topic);
                  setView("topic");
                }}
              />
            </div>
          )}
          {view === "topic" && selectedTopic && (
            <div>
              <button className="btn ghost block mb-4" onClick={() => { setView("topics"); setSelectedTopic(null); }}>
                ← {t("backToTopics")}
              </button>
            </div>
          )}
        </aside>

        <main className="forum-main">
          {view === "list" && (
            <div>
              <h1>{t("forums")}</h1>
              <ForumList 
                locale={locale} 
                onForumSelect={(forum) => {
                  setSelectedForum(forum);
                  setView("topics");
                }}
              />
            </div>
          )}
          {view === "topics" && selectedForum && (
            <div>
              <div className="forum-header">
                <h2>{selectedForum.title}</h2>
                {selectedForum.description && <p>{selectedForum.description}</p>}
              </div>
              <ForumTopicList 
                locale={locale} 
                forumId={selectedForum.id}
                onTopicSelect={(topic) => {
                  setSelectedTopic(topic);
                  setView("topic");
                }}
              />
            </div>
          )}
          {view === "topic" && selectedTopic && (
            <ForumTopicView 
              locale={locale} 
              forumId={selectedForum?.id || forumId} 
              topic={selectedTopic} 
              onBack={() => { setView("topics"); setSelectedTopic(null); }}
            />
          )}
        </main>
      </div>
    </div>
  );
}

import { useEffect } from "react";