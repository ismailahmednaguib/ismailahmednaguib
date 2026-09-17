// components/QuizManager.tsx : إدارة الاختبارات في لوحة التحكم
"use client";
import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";

interface Quiz {
  id: string;
  course_slug: string;
  lesson_id: string | null;
  title: string;
  description: string;
  time_limit: number | null;
  passing_score: number;
  max_attempts: number;
  published: boolean;
  created_at: string;
}

export default function QuizManager({ locale, courseSlug }: { locale: string; courseSlug?: string }) {
  const t = useTranslations("quizzes");
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  const [formData, setFormData] = useState({
    course_slug: courseSlug || "",
    lesson_id: "",
    title: "",
    description: "",
    time_limit: "",
    passing_score: "60",
    max_attempts: "3",
    published: false,
  });

  useEffect(() => {
    fetchQuizzes();
  }, [courseSlug]);

  async function fetchQuizzes() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (courseSlug) params.set("course", courseSlug);
      params.set("published", "false"); // الأدمن يرى كل شيء
      const res = await fetch(`/${locale}/api/quizzes?${params}`);
      const data = await res.json();
      if (data.ok) setQuizzes(data.quizzes || []);
    } catch {
      // تجاهل الخطأ
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const url = editingQuiz ? `/${locale}/api/quizzes` : `/${locale}/api/quizzes`;
      const method = editingQuiz ? "PUT" : "POST";
      const body = {
        ...formData,
        time_limit: formData.time_limit ? Number(formData.time_limit) : null,
        passing_score: Number(formData.passing_score),
        max_attempts: Number(formData.max_attempts),
        published: formData.published,
        ...(editingQuiz ? { id: editingQuiz.id } : {}),
      };
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.ok) {
        fetchQuizzes();
        cancelForm();
      } else {
        alert(data.error || t("saveError"));
      }
    } catch {
      alert(t("networkError"));
    } finally {
      setLoading(false);
    }
  }

  function editQuiz(quiz: Quiz) {
    setEditingQuiz(quiz);
    setFormData({
      course_slug: quiz.course_slug,
      lesson_id: quiz.lesson_id || "",
      title: quiz.title,
      description: quiz.description,
      time_limit: quiz.time_limit?.toString() || "",
      passing_score: quiz.passing_score.toString(),
      max_attempts: quiz.max_attempts.toString(),
      published: quiz.published,
    });
    setShowForm(true);
  }

  function cancelForm() {
    setShowForm(false);
    setEditingQuiz(null);
    setFormData({
      course_slug: courseSlug || "",
      lesson_id: "",
      title: "",
      description: "",
      time_limit: "",
      passing_score: "60",
      max_attempts: "3",
      published: false,
    });
  }

  async function deleteQuiz(id: string) {
    if (!confirm(t("confirmDelete"))) return;
    try {
      const res = await fetch(`/${locale}/api/quizzes?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.ok) fetchQuizzes();
      else alert(data.error || t("deleteError"));
    } catch {
      alert(t("networkError"));
    }
  }

  async function togglePublish(id: string, published: boolean) {
    try {
      const res = await fetch(`/${locale}/api/quizzes`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, published }),
      });
      const data = await res.json();
      if (data.ok) fetchQuizzes();
      else alert(data.error || t("saveError"));
    } catch {
      alert(t("networkError"));
    }
  }

  if (loading) return <div className="loading">{t("loading")}</div>;

  return (
    <div className="quiz-manager">
      <div className="manager-header">
        <h2>{t("manageQuizzes")}</h2>
        <button className="btn gold" onClick={() => { setEditingQuiz(null); setShowForm(true); }}>
          {t("addQuiz")}
        </button>
      </div>

      {showForm && (
        <div className="panel quiz-form">
          <h3>{editingQuiz ? t("editQuiz") : t("addQuiz")}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <label>{t("courseSlug")} *</label>
              <input 
                value={formData.course_slug} 
                onChange={(e) => setFormData({...formData, course_slug: e.target.value})} 
                required
                disabled={!!editingQuiz}
              />
            </div>
            <div className="form-row">
              <label>{t("lessonId")} (اختياري)</label>
              <input 
                value={formData.lesson_id} 
                onChange={(e) => setFormData({...formData, lesson_id: e.target.value})} 
              />
            </div>
            <div className="form-row">
              <label>{t("title")} *</label>
              <input 
                value={formData.title} 
                onChange={(e) => setFormData({...formData, title: e.target.value})} 
                required
              />
            </div>
            <div className="form-row">
              <label>{t("description")}</label>
              <textarea 
                value={formData.description} 
                onChange={(e) => setFormData({...formData, description: e.target.value})} 
                rows={3}
              />
            </div>
            <div className="form-grid">
              <div className="form-row">
                <label>{t("timeLimit")} (دقيقة)</label>
                <input 
                  type="number" 
                  value={formData.time_limit} 
                  onChange={(e) => setFormData({...formData, time_limit: e.target.value})} 
                  min="1"
                />
              </div>
              <div className="form-row">
                <label>{t("passingScore")} %</label>
                <input 
                  type="number" 
                  value={formData.passing_score} 
                  onChange={(e) => setFormData({...formData, passing_score: e.target.value})} 
                  min="1" max="100"
                  required
                />
              </div>
              <div className="form-row">
                <label>{t("maxAttempts")}</label>
                <input 
                  type="number" 
                  value={formData.max_attempts} 
                  onChange={(e) => setFormData({...formData, max_attempts: e.target.value})} 
                  min="1" max="10"
                  required
                />
              </div>
            </div>
            <div className="form-row checkbox">
              <label>
                <input 
                  type="checkbox" 
                  checked={formData.published} 
                  onChange={(e) => setFormData({...formData, published: e.target.checked})} 
                />
                {t("published")}
              </label>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn gold" disabled={loading}>
                {loading ? t("saving") : (editingQuiz ? t("update") : t("create"))}
              </button>
              <button type="button" className="btn ghost" onClick={cancelForm}>{t("cancel")}</button>
            </div>
          </form>
        </div>
      )}

      <div className="quiz-list">
        {quizzes.length === 0 ? (
          <p className="mut">{t("noQuizzes")}</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>{t("title")}</th>
                <th>{t("course")}</th>
                <th>{t("questions")}</th>
                <th>{t("timeLimit")}</th>
                <th>{t("passingScore")}</th>
                <th>{t("attempts")}</th>
                <th>{t("status")}</th>
                <th>{t("actions")}</th>
              </tr>
            </thead>
            <tbody>
              {quizzes.map((quiz) => (
                <tr key={quiz.id}>
                  <td>{quiz.title}</td>
                  <td>{quiz.course_slug}</td>
                  <td>-</td>
                  <td>{quiz.time_limit ? `${quiz.time_limit} ${t("minutes")}` : t("unlimited")}</td>
                  <td>{quiz.passing_score}%</td>
                  <td>{quiz.max_attempts}</td>
                  <td>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={quiz.published}
                        onChange={(e) => togglePublish(quiz.id, e.target.checked)}
                      />
                      <span className="slider"></span>
                    </label>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <Link href={`/${locale}/dashboard/quizzes/${quiz.id}/questions`} className="btn sm">
                        {t("questions")}
                      </Link>
                      <button className="btn sm ghost" onClick={() => editQuiz(quiz)}>{t("edit")}</button>
                      <button className="btn sm danger" onClick={() => deleteQuiz(quiz.id)}>{t("delete")}</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}