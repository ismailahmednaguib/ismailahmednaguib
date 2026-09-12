// lib/track-settings.ts : عناوين المسارات الأربعة من اللوحة — ملف مستقل
import { TRACKS } from "./site";
import { db } from "./db";

export interface TrackSetting { slug: string; title: string; desc: string; icon: string; }

export async function getTracks(): Promise<TrackSetting[]> {
  let raw: Record<string, unknown> = {};
  try {
    const s = await db.settings();
    raw = ((s || {}) as Record<string, unknown>);
  } catch { raw = {}; }
  return TRACKS.map((t) => {
    const ti = typeof raw[`track_${t.slug}_title`] === "string" && String(raw[`track_${t.slug}_title`]).trim()
      ? String(raw[`track_${t.slug}_title`]) : t.title;
    const de = typeof raw[`track_${t.slug}_desc`] === "string" && String(raw[`track_${t.slug}_desc`]).trim()
      ? String(raw[`track_${t.slug}_desc`]) : t.desc;
    return { slug: t.slug, title: ti, desc: de, icon: t.icon };
  });
}

export const TRACK_KEYS = ["academy", "institute", "quran", "college"].flatMap((s) => [`track_${s}_title`, `track_${s}_desc`]);
