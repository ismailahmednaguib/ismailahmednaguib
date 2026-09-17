import type { MetadataRoute } from "next";
import { db } from "../lib/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
  const now = new Date();
  
  const staticPages = [
    "", "/courses", "/library", "/quran", "/scholars", "/fatwa", "/news", "/verify", "/admission", "/search", "/contact",
  ].map((p) => ({
    url: `${base}${p || "/"}`,
    lastModified: now,
    changeFrequency: "daily" as const,
    priority: p === "" ? 1.0 : 0.8,
  }));

  // Dynamic pages from database - only published
  const [courses, books, scholars, news, fatwas] = await Promise.all([
    db.courses().catch(() => []),
    db.books().catch(() => []),
    db.scholars().catch(() => []),
    db.news().catch(() => []),
    db.fatwas().catch(() => []),
  ]);

  const dynamicPages = [
    ...courses
      .filter((c: { slug: string; published?: boolean }) => c.published !== false)
      .map((c: { slug: string }) => ({
        url: `${base}/courses/${c.slug}`,
        lastModified: now,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      })),
    ...books
      .filter((b: { slug: string; published?: boolean }) => b.published !== false)
      .map((b: { slug: string }) => ({
        url: `${base}/library/${b.slug}`,
        lastModified: now,
        changeFrequency: "monthly" as const,
        priority: 0.6,
      })),
    ...scholars
      .filter((s: { slug: string; published?: boolean }) => s.published !== false)
      .map((s: { slug: string }) => ({
        url: `${base}/scholars/${s.slug}`,
        lastModified: now,
        changeFrequency: "monthly" as const,
        priority: 0.6,
      })),
    ...news
      .filter((n: { slug: string; published?: boolean }) => n.published !== false)
      .map((n: { slug: string }) => ({
        url: `${base}/news/${n.slug}`,
        lastModified: now,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      })),
    ...fatwas
      .filter((f: { id: string; published?: boolean }) => f.published !== false)
      .map((f: { id: string }) => ({
        url: `${base}/fatwa/${f.id}`,
        lastModified: now,
        changeFrequency: "monthly" as const,
        priority: 0.6,
      })),
  ];

  return [...staticPages, ...dynamicPages];
}