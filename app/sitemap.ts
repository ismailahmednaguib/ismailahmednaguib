import type { MetadataRoute } from "next";
import { db } from "../lib/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
  const now = new Date();
  
  const staticPages = [
    "", "/courses", "/library", "/quran", "/scholars", "/fatwa", "/news", "/verify", "/admission",
  ].map((p) => ({
    url: `${base}${p || "/"}`,
    lastModified: now,
    changeFrequency: "daily" as const,
    priority: p === "" ? 1.0 : 0.8,
  }));

  // Dynamic pages from database
  const [courses, books, scholars, news] = await Promise.all([
    db.courses().catch(() => []),
    db.books().catch(() => []),
    db.scholars().catch(() => []),
    db.news().catch(() => []),
  ]);

  const dynamicPages = [
    ...courses.map((c: { slug: string }) => ({
      url: `${base}/courses/${c.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...books.map((b: { slug: string }) => ({
      url: `${base}/library/${b.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...scholars.map((s: { slug: string }) => ({
      url: `${base}/scholars/${s.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...news.map((n: { slug: string }) => ({
      url: `${base}/news/${n.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];

  return [...staticPages, ...dynamicPages];
}