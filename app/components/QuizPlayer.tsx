// components/QuizPlayer.tsx : مشغل الاختبار للطالب
"use client";
import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";

interface Question {
  id: string;
  question_text: string;
  question_type: string;
  explanation: string;
  points: number;
  options: { id: string; option_text: string; is_correct?: boolean; order_index: number }[];
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  time_limit: number | null;
  passing_score: number;
  max_attempts: number;
  shuffle_questions: boolean;
  shuffle_options: boolean;
  show_correct_answers: boolean;
  questions: Question[];
}

interface Attempt {
  id: string;
  score: number;
  max_score: number;
  percentage: number;
  passed: boolean;
  started_at: string;
  completed_at: string | null;
  answers: Record<string, string[]>;
  time_spent: number;
}

export default function QuizPlayer({ 
  quiz, 
  locale, 
  userRole,
  onComplete 
}: { 
  quiz: Quiz; 
  locale: string; 
  userRole: string;
  onComplete?: (result: { passed: boolean; percentage: number }) => void;
}) {
  const t = useTranslations("quizzes");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [timeLeft, setTimeLeft] = useState(quiz.time_limit ? quiz.time_limit * 60 : null);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<{ passed: boolean; percentage: number; score: number; maxScore: number } | null>(null);
  const [loading, setLoading] = useState(false);

  // Timer
  useEffect(() => {
    if (!quiz.time_limit || submitted) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [quiz.time_limit, submitted]);

  const formatTime = (seconds: number | null) => {
    if (seconds === null) return "--:--";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleAnswerChange = (questionId: string, optionId: string, isMulti = false) => {
    setAnswers((prev) => {
      if (isMulti) {
        const current = prev[questionId] || [];
        const updated = current.includes(optionId)
          ? current.filter((id) => id !== optionId)
          : [...current, optionId];
        return { ...prev, [questionId]: updated };
      }
      return { ...prev, [questionId]: [optionId] };
    });
  };

  const handleSubmit = async () => {
    if (submitted) return;
    setLoading(true);
    setSubmitted(true);

    try {
      const res = await fetch(`/${locale}/api/quizzes/${quiz.id}/attempt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          answers, 
          time_spent: quiz.time_limit ? quiz.time_limit * 60 - (timeLeft || 0) : 0 
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setResult(data.result);
        onComplete?.(data.result);
      } else {
        alert(data.error || t("submitError"));
        setSubmitted(false);
      }
    } catch {
      alert(t("networkError"));
      setSubmitted(false);
    } finally {
      setLoading(false);
    }
  };

  const goToQuestion = (index: number) => {
    setCurrentQuestion(Math.max(0, Math.min(index, quiz.questions.length - 1)));
  };

  const question = quiz.questions[currentQuestion];
  const isMulti = question?.question_type === "multiple_answer";

  if (submitted && result) {
    return (
      <div className="quiz-result">
        <div className={`result-header ${result.passed ? "passed" : "failed"}`}>
          <h2>{result.passed ? t("congratulations") : t("tryAgain")}</h2>
          <div className="result-score">
            <span className="score-circle">{result.percentage}%</span>
            <div>
              <p>{t("yourScore")}: {result.score} / {result.maxScore}</p>
              <p>{t("passingScore")}: {quiz.passing_score}%</p>
            </div>
          </div>
        </div>
        <div className="result-details">
          {quiz.questions.map((q, i) => {
            const userAnswerIds = answers[q.id] || [];
            const correctOptions = q.options.filter((o) => o.is_correct);
            const isCorrect = 
              correctOptions.length === userAnswerIds.length &&
              correctOptions.every((o) => userAnswerIds.includes(o.id));
            return (
              <div key={q.id} className={`question-review ${isCorrect ? "correct" : "incorrect"}`}>
                <h4>{i + 1}. {q.question_text}</h4>
                <div className="review-options">
                  {q.options.map((opt) => (
                    <div
                      key={opt.id}
                      className={`review-option ${opt.is_correct ? "correct-answer" : ""} ${userAnswerIds.includes(opt.id) ? "user-answer" : ""}`}
                    >
                      {opt.option_text}
                      {opt.is_correct && <span className="badge">✓</span>}
                      {userAnswerIds.includes(opt.id) && !opt.is_correct && <span className="badge error">✗</span>}
                    </div>
                  ))}
                </div>
                {q.explanation && <p className="explanation">{q.explanation}</p>}
              </div>
            );
          })}
        </div>
        <div className="result-actions">
          <Link href={`/${locale}/student/quizzes`} className="btn gold">{t("backToQuizzes")}</Link>
          {!result.passed && <button className="btn ghost" onClick={() => window.location.reload()}>{t("retake")}</button>}
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-player">
      <div className="quiz-header">
        <h1>{quiz.title}</h1>
        {quiz.time_limit && (
          <div className={`quiz-timer ${timeLeft !== null && timeLeft < 300 ? "warning" : ""}`}>
            ⏱️ {formatTime(timeLeft)}
          </div>
        )}
      </div>

      <div className="quiz-progress">
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${((currentQuestion + 1) / quiz.questions.length) * 100}%` }}
          />
        </div>
        <span>{currentQuestion + 1} / {quiz.questions.length}</span>
      </div>

      {question && (
        <div className="quiz-question">
          <div className="question-header">
            <span className="question-type">{t(question.question_type)}</span>
            <span className="question-points">{question.points} {t("points")}</span>
          </div>
          <h3>{question.question_text}</h3>
          <div className="question-options">
            {question.options.map((opt) => (
              <label key={opt.id} className={`option ${answers[question.id]?.includes(opt.id) ? "selected" : ""}`}>
                <input
                  type={isMulti ? "checkbox" : "radio"}
                  name={`q-${question.id}`}
                  checked={answers[question.id]?.includes(opt.id)}
                  onChange={() => handleAnswerChange(question.id, opt.id, isMulti)}
                />
                <span>{opt.option_text}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="quiz-navigation">
        <button 
          className="btn ghost" 
          onClick={() => goToQuestion(currentQuestion - 1)}
          disabled={currentQuestion === 0}
        >
          {t("previous")}
        </button>
        <div className="question-numbers">
          {quiz.questions.map((_, i) => (
            <button
              key={i}
              className={`qnum ${i === currentQuestion ? "current" : ""} ${answers[quiz.questions[i].id] ? "answered" : ""}`}
              onClick={() => goToQuestion(i)}
            >
              {i + 1}
            </button>
          ))}
        </div>
        <button 
          className="btn gold" 
          onClick={currentQuestion === quiz.questions.length - 1 ? handleSubmit : () => goToQuestion(currentQuestion + 1)}
          disabled={loading}
        >
          {currentQuestion === quiz.questions.length - 1 ? (loading ? t("submitting") : t("submit")) : t("next")}
        </button>
      </div>
    </div>
  );
}