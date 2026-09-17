// app/components-Cards.tsx : كروت العرض (دورة بصورة يوتيوب / كتاب) — نص الزر من اللوحة
"use client";
import Link from "next/link";
import { youtubeThumb } from "../lib/youtube";
import { useTranslations } from "next-intl";
import type { Course, Book } from "../lib/types";

export function CourseCard({ c, locale = "ar" }: { c: Course; locale?: string }) {
  const t = useTranslations("courses");
  const thumb = c.videoUrl ? youtubeThumb(c.videoUrl) : null;
  return (
    <div className="card">
      <div className="thumb">{thumb ? <img src={thumb} alt={c.title} loading="lazy" /> : "🎓"}</div>
      <div className="pad"><span className="badge">{c.track} • {c.level}</span>
        <b>{c.title}</b><span className="mut">{c.teacher} • {c.hours} {t("lessons")}</span>
        <span className="mut">{c.desc}</span>
        <div className="row"><Link className="btn sm" href={`/${locale}/courses/${c.slug}`}>{t("viewDetails")}</Link><span className="mut">{c.price === 0 ? t("free") : c.price + " ج"}</span></div>
      </div></div>
  );
}
export function BookCard({ b, locale = "ar", readLabel }: { b: Book; locale?: string; readLabel?: string }) {
  const t = useTranslations("library");
  return (
    <div className="card"><div className="thumb">📚</div>
      <div className="pad"><span className="badge">{b.track}</span><b>{b.title}</b>
        <span className="mut">{b.author} • {b.pages} {t("pages")}</span><span className="mut">{b.desc}</span>
        <div className="row"><a className="btn sm" href={b.pdfUrl || "#"} target="_blank" rel="noreferrer">{readLabel || t("downloadPdf")}</a></div>
      </div></div>
  );
}