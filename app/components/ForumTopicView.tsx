// components/ForumTopicView.tsx : عرض موضوع المنتدى مع الردود
"use client";
import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";

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
  posts?: Post[];
}

interface Post {
  id: string;
  topic_id: string;
  user_id: string;
  content: string;
  parent_id: string | null;
  is_solution: boolean;
  created_at: string;
  updated_at: string;
  user?: { email: string };
  replies?: Post[];
  userVote?: string;
}

interface ForumTopicViewProps {
  locale: string;
  forumId: string;
  topic: Topic;
  onBack: () => void;
}

export default function ForumTopicView({ locale, forumId, topic, onBack }: ForumTopicViewProps) {
  const t = useTranslations("forums");
  const [posts, setPosts] = useState<Post[]>(topic.posts || []);
  const [userVotes, setUserVotes] = useState<Record<string, string>>({});
  const [replyContent, setReplyContent] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUserVotes();
  }, [locale, forumId, topic.id]);

  const fetchUserVotes = async () => {
    try {
      const res = await fetch(`/${locale}/api/forums/${forumId}/topics/${topic.id}/vote`);
      const data = await res.json();
      if (data.ok) {
        const votes: Record<string, string> = {};
        if (data.topicVote) votes[`topic-${topic.id}`] = data.topicVote;
        Object.entries(data.postVotes).forEach(([postId, vote]) => {
          votes[`post-${postId}`] = vote as string;
        });
        setUserVotes(votes);
      }
    } catch {
      // تجاهل الخطأ
    }
  };

  const handleVote = async (type: "topic" | "post", id: string, vote: "up" | "down") => {
    try {
      const res = await fetch(`/${locale}/api/forums/${forumId}/topics/${topic.id}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voteType: vote, postId: type === "post" ? id : undefined }),
      });
      const data = await res.json();
      if (data.ok) {
        setUserVotes(prev => ({ ...prev, [`${type}-${id}`]: vote }));
      }
    } catch {
      // تجاهل الخطأ
    }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/${locale}/api/forums/${forumId}/topics/${topic.id}/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: replyContent, parent_id: replyingTo }),
      });
      const data = await res.json();
      if (data.ok) {
        setReplyContent("");
        setReplyingTo(null);
        // إضافة الرد محلياً
        const newPost = { ...data.post, user: { email: "أنت" }, replies: [] };
        if (replyingTo) {
          setPosts(prev => prev.map(p => {
            if (p.id === replyingTo) return { ...p, replies: [...(p.replies || []), newPost] };
            return p;
          }));
        } else {
          setPosts(prev => [...prev, newPost]);
        }
      } else {
        alert(data.error || t("replyError"));
      }
    } catch {
      alert(t("networkError"));
    } finally {
      setLoading(false);
    }
  };

  const handleMarkSolution = async (postId: string) => {
    try {
      await fetch(`/${locale}/api/forums/${forumId}/topics/${topic.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topicId: topic.id, is_resolved: true }),
      });
      // تحديث محلي
      setPosts(prev => prev.map(p => ({
        ...p,
        is_solution: p.id === postId,
        replies: p.replies?.map(r => ({ ...r, is_solution: r.id === postId })) || []
      })));
    } catch {
      // تجاهل الخطأ
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString(locale === "ar" ? "ar-SA" : "en-US");
  };

  const renderPosts = (postsToRender: Post[], level = 0) => (
    <div className="posts-list" style={{ marginRight: level * 20 }}>
      {postsToRender.map((post) => (
        <article key={post.id} className={`post ${post.is_solution ? "solution" : ""}`} style={{ marginLeft: level * 20 }}>
          <div className="post-header">
            <div className="post-author">
              <span className="author-name">{post.user?.email || t("unknown")}</span>
              <span className="post-date">{formatDate(post.created_at)}</span>
              {post.is_solution && <span className="solution-badge">{t("solution")}</span>}
            </div>
            <div className="post-vote">
              <button 
                className={`vote-btn ${userVotes[`post-${post.id}`] === "up" ? "voted" : ""}`}
                onClick={() => handleVote("post", post.id, "up")}
                title={t("upvote")}
              >▲</button>
              <span className="vote-count">{0}</span>
              <button 
                className={`vote-btn ${userVotes[`post-${post.id}`] === "down" ? "voted" : ""}`}
                onClick={() => handleVote("post", post.id, "down")}
                title={t("downvote")}
              >▼</button>
            </div>
          </div>
          <div className="post-content">{post.content}</div>
          <div className="post-actions">
            <button className="btn sm ghost" onClick={() => setReplyingTo(post.id)}>
              {t("reply")}
            </button>
            {!post.is_solution && (
              <button className="btn sm ghost" onClick={() => handleMarkSolution(post.id)}>
                {t("markSolution")}
              </button>
            )}
          </div>
          {post.replies && post.replies.length > 0 && (
            <div className="post-replies">
              {renderPosts(post.replies, level + 1)}
            </div>
          )}
          {replyingTo === post.id && (
            <form onSubmit={handleReply} className="reply-form">
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                rows={3}
                placeholder={t("replyPlaceholder")}
                autoFocus
              />
              <div className="reply-actions">
                <button type="submit" className="btn sm gold" disabled={loading}>
                  {loading ? t("posting") : t("postReply")}
                </button>
                <button type="button" className="btn sm ghost" onClick={() => setReplyingTo(null)}>
                  {t("cancel")}
                </button>
              </div>
            </form>
          )}
        </article>
      ))}
    </div>
  );

  return (
    <div className="topic-view">
      <button className="back-btn" onClick={onBack}>{t("backToTopics")}</button>
      
      <article className="topic-main">
        <header className="topic-header">
          {topic.is_pinned && <span className="pin-badge">{t("pinned")}</span>}
          {topic.is_locked && <span className="lock-badge">{t("locked")}</span>}
          {topic.is_resolved && <span className="resolved-badge">{t("resolved")}</span>}
          <h1>{topic.title}</h1>
          <div className="topic-meta">
            <span>{t("by")} {topic.user?.email || t("unknown")}</span>
            <span>{t("at")} {formatDate(topic.created_at)}</span>
            <span>{topic.view_count} {t("views")}</span>
            <span>{topic.reply_count} {t("replies")}</span>
          </div>
        </header>
        <div className="topic-content">{topic.content}</div>
        <div className="topic-vote">
          <button 
            className={`vote-btn ${userVotes[`topic-${topic.id}`] === "up" ? "voted" : ""}`}
            onClick={() => handleVote("topic", topic.id, "up")}
            title={t("upvote")}
          >▲</button>
          <span className="vote-count">{0}</span>
          <button 
            className={`vote-btn ${userVotes[`topic-${topic.id}`] === "down" ? "voted" : ""}`}
            onClick={() => handleVote("topic", topic.id, "down")}
            title={t("downvote")}
          >▼</button>
        </div>
      </article>

      <section className="replies-section">
        <h2>{t("replies")} ({topic.reply_count})</h2>
        {posts.length === 0 ? (
          <p className="mut">{t("noReplies")}</p>
        ) : (
          renderPosts(posts)
        )}
      </section>

      <section className="reply-section">
        <h3>{t("addReply")}</h3>
        <form onSubmit={handleReply}>
          <textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            rows={4}
            placeholder={t("replyPlaceholder")}
            disabled={loading}
          />
          <div className="reply-actions">
            <button type="submit" className="btn gold" disabled={loading || !replyContent.trim()}>
              {loading ? t("posting") : t("postReply")}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleString("ar-SA"); // سيُستبدل في المكون الفعلي
};