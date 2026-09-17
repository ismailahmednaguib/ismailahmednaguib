// app/api/search/route.ts : بحث شامل عبر الدورات والكتب والأخبار
import { NextResponse } from "next/server";
import { db } from "../../../lib/db";
import { cleanText } from "../../../lib/security";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = cleanText(searchParams.get("q") || "", 100);
  const type = searchParams.get("type") || "all";
  const limit = Math.min(Number(searchParams.get("limit") || 20), 50);

  if (!q || q.length < 2) {
    return NextResponse.json({ ok: true, results: [] });
  }

  const [courses, books, news, scholars, fatwas] = await Promise.all([
    type === "all" || type === "courses" ? db.courses() : Promise.resolve([]),
    type === "all" || type === "books" ? db.books() : Promise.resolve([]),
    type === "all" || type === "news" ? db.news() : Promise.resolve([]),
    type === "all" || type === "scholars" ? db.scholars() : Promise.resolve([]),
    type === "all" || type === "fatwas" ? db.fatwas() : Promise.resolve([]),
  ]);

  const lowerQ = q.toLowerCase();
  const matches = (text: string) => text.toLowerCase().includes(lowerQ);

  const results: Array<{
    type: string;
    title: string;
    desc: string;
    url: string;
    track?: string;
    image?: string;
  }> = [];

  if (courses.length) {
    for (const c of courses) {
      // تجاهل غير المنشورة في البحث العام
      if (c.published === false) continue;
      if (matches(c.title) || matches(c.desc) || matches(c.teacher)) {
        results.push({
          type: "course",
          title: c.title,
          desc: `${c.teacher} • ${c.hours} ساعة • ${c.track}`,
          url: `/courses/${c.slug}`,
          track: c.track,
        });
        if (results.length >= limit) break;
      }
    }
  }

  if (books.length && results.length < limit) {
    for (const b of books) {
      if (b.published === false) continue;
      if (matches(b.title) || matches(b.desc) || matches(b.author)) {
        results.push({
          type: "book",
          title: b.title,
          desc: `${b.author} • ${b.pages} صفحة • ${b.track}`,
          url: `/library`,
          track: b.track,
        });
        if (results.length >= limit) break;
      }
    }
  }

  if (news.length && results.length < limit) {
    for (const n of news) {
      if (n.published === false) continue;
      if (matches(n.title) || matches(n.body)) {
        results.push({
          type: "news",
          title: n.title,
          desc: `${n.date} • ${n.body.slice(0, 100)}`,
          url: `/news`,
        });
        if (results.length >= limit) break;
      }
    }
  }

  if (scholars.length && results.length < limit) {
    for (const s of scholars) {
      if (s.published === false) continue;
      if (matches(s.name) || matches(s.title) || matches(s.bio)) {
        results.push({
          type: "scholar",
          title: s.name,
          desc: `${s.title} • ${s.bio.slice(0, 100)}`,
          url: `/scholars`,
        });
        if (results.length >= limit) break;
      }
    }
  }

  if (fatwas.length && results.length < limit) {
    for (const f of fatwas) {
      if (f.published === false) continue;
      if (matches(f.q) || matches(f.a) || matches(f.scholar)) {
        results.push({
          type: "fatwa",
          title: f.q.slice(0, 80),
          desc: `${f.scholar} • ${f.a.slice(0, 100)}`,
          url: `/fatwa`,
        });
        if (results.length >= limit) break;
      }
    }
  }

  return NextResponse.json({ ok: true, results: results.slice(0, limit) });
}