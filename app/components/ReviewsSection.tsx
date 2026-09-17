// components/ReviewsSection.tsx : قسم التقييمات في صفحة الكورس
"use client";
import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import ReviewStars from "./ReviewStars";

interface Review {
  id: string;
  user_id: string;
  rating: number;
  title: string;
  content: string;
  helpful_count: number;
  created_at: string;
  user_email?: string;
}

interface ReviewsSectionProps {
  courseSlug: string;
  locale: string;
  initialStats?: {
    totalReviews: number;
    avgRating: number;
    ratingDistribution: { stars: number; count: number; percentage: number }[];
  };
}

export default function ReviewsSection({ courseSlug, locale, initialStats }: ReviewsSectionProps) {
  const t = useTranslations("reviews");
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState(initialStats || { totalReviews: 0, avgRating: 0, ratingDistribution: [] });
  const [loading, setLoading] = useState(!initialStats);
  const [showForm, setShowForm] = useState(false);
  const [userReview, setUserReview] = useState<Review | null>(null);
  const [formData, setFormData] = useState({ rating: 0, title: "", content: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, [courseSlug, locale]);

  async function fetchReviews() {
    setLoading(true);
    try {
      const res = await fetch(`/${locale}/api/reviews?course=${courseSlug}`);
      const data = await res.json();
      if (data.ok) {
        setReviews(data.reviews || []);
        if (data.stats) setStats(data.stats);
        // العثور على تقييم المستخدم الحالي
        const user = await getCurrentUser();
        if (user) {
          const ur = data.reviews?.find((r: Review) => r.user_email === user.email);
          if (ur) setUserReview(ur);
        }
      }
    } catch {
      // تجاهل الخطأ
    } finally {
      setLoading(false);
    }
  }

  async function getCurrentUser() {
    try {
      const res = await fetch("/api/me");
      const data = await res.json();
      return data.ok ? data.user : null;
    } catch {
      return null;
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.rating) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/${locale}/api/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ course_slug: courseSlug, ...formData }),
      });
      const data = await res.json();
      if (data.ok) {
        setShowForm(false);
        setFormData({ rating: 0, title: "", content: "" });
        fetchReviews();
      } else {
        alert(data.error || t("submitError"));
      }
    } catch {
      alert(t("networkError"));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm(t("confirmDelete"))) return;
    try {
      const res = await fetch(`/${locale}/api/reviews?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.ok) fetchReviews();
      else alert(data.error || t("deleteError"));
    } catch {
      alert(t("networkError"));
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(locale === "ar" ? "ar-SA" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) return <div className="reviews-loading">{t("loading")}</div>;

  return (
    <section className="reviews-section">
      <div className="reviews-header">
        <h3>{t("reviewsTitle")}</h3>
        {!userReview && (
          <button className="btn gold" onClick={() => setShowForm(true)}>
            {t("writeReview")}
          </button>
        )}
      </div>

      <div className="reviews-summary">
        <div className="summary-main">
          <div className="avg-rating">{stats.avgRating.toFixed(1)}</div>
          <ReviewStars rating={stats.avgRating} size="lg" showValue />
          <div className="total-reviews">{stats.totalReviews} {t("reviews")}</div>
        </div>
        <div className="rating-bars">
          {stats.ratingDistribution?.map((dist) => (
            <div key={dist.stars} className="rating-bar">
              <span className="bar-label">{dist.stars} ★</span>
              <div className="bar-track">
                <div 
                  className="bar-fill" 
                  style={{ width: `${dist.percentage}%` }}
                />
              </div>
              <span className="bar-count">{dist.count}</span>
            </div>
          ))}
        </div>
      </div>

      {showForm && (
        <div className="panel review-form">
          <h4>{userReview ? t("editReview") : t("writeReview")}</h4>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <label>{t("yourRating")} *</label>
              <ReviewStars 
                interactive 
                rating={formData.rating} 
                defaultRating={formData.rating}
                onChange={(r) => setFormData({...formData, rating: r})}
                size="lg"
                showValue
              />
            </div>
            <div className="form-row">
              <label>{t("reviewTitle")}</label>
              <input 
                value={formData.title} 
                onChange={(e) => setFormData({...formData, title: e.target.value})} 
                placeholder={t("reviewTitlePlaceholder")}
              />
            </div>
            <div className="form-row">
              <label>{t("reviewContent")}</label>
              <textarea 
                value={formData.content} 
                onChange={(e) => setFormData({...formData, content: e.target.value})} 
                rows={4}
                placeholder={t("reviewContentPlaceholder")}
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn gold" disabled={submitting || !formData.rating}>
                {submitting ? t("submitting") : (userReview ? t("update") : t("submit"))}
              </button>
              <button type="button" className="btn ghost" onClick={() => { setShowForm(false); setFormData({ rating: 0, title: "", content: "" }); }}>
                {t("cancel")}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="reviews-list">
        {reviews.length === 0 ? (
          <p className="mut">{t("noReviews")}</p>
        ) : (
          reviews.map((review) => (
            <article key={review.id} className="review-card">
              <div className="review-header">
                <div className="reviewer">
                  <span className="reviewer-name">{review.user_email || t("anonymous")}</span>
                  <span className="review-date">{formatDate(review.created_at)}</span>
                </div>
                <ReviewStars rating={review.rating} size="sm" showValue />
              </div>
              {review.title && <h4 className="review-title">{review.title}</h4>}
              {review.content && <p className="review-content">{review.content}</p>}
              <div className="review-footer">
                <span>{review.helpful_count} {t("helpful")}</span>
                {userReview?.id === review.id && (
                  <button className="btn sm ghost" onClick={() => handleDelete(review.id)}>
                    {t("delete")}
                  </button>
                )}
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}