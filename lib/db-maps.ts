// lib/db-maps.ts : تحويل صفوف الجداول العدلة <-> شكل الموقع — ملف مستقل
import type { Course, Book, Lesson } from "./types";

export function rowToCourse(r: Record<string, unknown>): Course {
  return {
    slug: String(r["slug"] || ""),
    title: String(r["title"] || ""),
    track: (String(r["track"] || "academy") as Course["track"]),
    level: String(r["level"] || ""),
    teacher: String(r["teacher"] || ""),
    hours: Number(r["hours"] || 0),
    price: Number(r["price"] || 0),
    desc: String(r["description"] ?? r["desc"] ?? ""),
    videoUrl: String(r["video_url"] ?? r["videoUrl"] ?? ""),
  };
}
export function courseToRow(c: Course): Record<string, unknown> {
  return {
    slug: c.slug, title: c.title, track: c.track, level: c.level || "",
    teacher: c.teacher || "", hours: Number(c.hours || 0), price: Number(c.price || 0),
    description: c.desc || "", video_url: c.videoUrl || "",
  };
}
export function rowToLesson(r: Record<string, unknown>): Lesson {
  return {
    id: String(r["id"] || ""),
    courseSlug: String(r["course_slug"] ?? r["courseSlug"] ?? ""),
    title: String(r["title"] || ""),
    videoUrl: String(r["video_url"] ?? r["videoUrl"] ?? ""),
    duration: String(r["duration"] || ""),
    free: r["is_free"] !== undefined ? !!r["is_free"] : r["free"] !== false,
  };
}
export function lessonToRow(l: Lesson): Record<string, unknown> {
  return {
    id: l.id, course_slug: l.courseSlug, title: l.title,
    video_url: l.videoUrl || "", duration: l.duration || "", is_free: !!l.free,
  };
}
export function rowToBook(r: Record<string, unknown>): Book {
  return {
    slug: String(r["slug"] || ""), title: String(r["title"] || ""),
    author: String(r["author"] || ""), track: (String(r["track"] || "academy") as Book["track"]),
    pages: Number(r["pages"] || 0), pdfUrl: String(r["pdf_url"] ?? r["pdfUrl"] ?? ""),
    desc: String(r["description"] ?? r["desc"] ?? ""),
  };
}
export function bookToRow(b: Book): Record<string, unknown> {
  return {
    slug: b.slug, title: b.title, author: b.author || "", track: b.track,
    pages: Number(b.pages || 0), pdf_url: b.pdfUrl || "", description: b.desc || "",
  };
}
