// app/api/admin/tracks/route.ts : إضافة/تعديل/حذف المسارات من اللوحة
import { NextResponse } from "next/server";
import { TRACKS } from "@/lib/site";
import { db } from "@/lib/db";
import { cleanText } from "@/lib/security";
import { currentUser, clientIp } from "@/lib/auth";
import { logAdd, logEdit, logDelete } from "@/lib/activity";

export async function GET() {
  const u = await currentUser();
  if (!u || u.role !== "admin") return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  const s = (await db.settings().catch(() => ({}))) as Record<string, string>;
  const out = TRACKS.map((t) => {
    const titleKey = `track_${t.slug}_title`;
    const descKey = `track_${t.slug}_desc`;
    const iconKey = `track_${t.slug}_icon`;
    const ti = typeof s[titleKey] === "string" && s[titleKey].trim()
      ? s[titleKey] : t.title;
    const de = typeof s[descKey] === "string" && s[descKey].trim()
      ? s[descKey] : t.desc;
    const ic = typeof s[iconKey] === "string" && s[iconKey].trim()
      ? s[iconKey] : t.icon;
    return { slug: t.slug, title: ti, desc: de, icon: ic };
  });
  return NextResponse.json({ ok: true, tracks: out });
}

export async function POST(req: Request) {
  const u = await currentUser();
  if (!u || u.role !== "admin") return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  const body = await req.json().catch(() => ({}));
  const slug = cleanText(String(body.slug || "").toLowerCase(), 40).replace(/[^a-z0-9_-]/g, "");
  const title = cleanText(String(body.title || ""), 120);
  const desc = cleanText(String(body.desc || ""), 400);
  const icon = cleanText(String(body.icon || ""), 10);
  if (!slug || !title) return NextResponse.json({ error: "slug وعنوان مطلوبان" }, { status: 400 });
  const s = await db.settings().catch(() => ({}));
  const next = { ...s };
  next[`track_${slug}_title`] = title;
  next[`track_${slug}_desc`] = desc;
  next[`track_${slug}_icon`] = icon;
  await db.write("settings.json", next);
  await logAdd("tracks", slug, `مسار جديد: ${title} (${slug})`, u.email, u.role, clientIp());
  return NextResponse.json({ ok: true, track: { slug, title, desc, icon } });
}

export async function PUT(req: Request) {
  const u = await currentUser();
  if (!u || u.role !== "admin") return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  const body = await req.json().catch(() => ({}));
  const slug = cleanText(String(body.slug || "").toLowerCase(), 40).replace(/[^a-z0-9_-]/g, "");
  const newSlug = cleanText(String(body.newSlug || "").toLowerCase(), 40).replace(/[^a-z0-9_-]/g, "");
  const title = cleanText(String(body.title || ""), 120);
  const desc = cleanText(String(body.desc || ""), 400);
  const icon = cleanText(String(body.icon || ""), 10);
  if (!slug) return NextResponse.json({ error: "slug مطلوب" }, { status: 400 });
  const s = await db.settings().catch(() => ({}));
  const next = { ...s };
  const target = newSlug || slug;
  if (newSlug && newSlug !== slug) {
    delete next[`track_${slug}_title`];
    delete next[`track_${slug}_desc`];
    delete next[`track_${slug}_icon`];
  }
  next[`track_${target}_title`] = title;
  next[`track_${target}_desc`] = desc;
  next[`track_${target}_icon`] = icon;
  await db.write("settings.json", next);
  await logEdit("tracks", target, `مسار: ${title} (${target})`, u.email, u.role, `تعديل المسار`, clientIp());
  return NextResponse.json({ ok: true, track: { slug: target, title, desc, icon } });
}

export async function DELETE(req: Request) {
  const u = await currentUser();
  if (!u || u.role !== "admin") return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  const slug = new URL(req.url).searchParams.get("slug") || "";
  if (!slug) return NextResponse.json({ error: "slug مطلوب" }, { status: 400 });
  const used = await db.courses().then((c) => c.some((x) => x.track === slug))
    || await db.books().then((b) => b.some((x) => x.track === slug));
  if (used) return NextResponse.json({ error: "لا يمكن حذف مسار مستخدم في دورات أو كتب" }, { status: 400 });
  const s = await db.settings().catch(() => ({}));
  const next = { ...s };
  delete next[`track_${slug}_title`];
  delete next[`track_${slug}_desc`];
  delete next[`track_${slug}_icon`];
  await db.write("settings.json", next);
  await logDelete("tracks", slug, `مسار: ${slug}`, u.email, u.role, clientIp());
  return NextResponse.json({ ok: true });
}