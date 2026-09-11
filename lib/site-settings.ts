// lib/site-settings.ts : إعدادات العرض من لوحة التحكم — ملف مستقل
// القيم الافتراضية من lib/site.ts، وأي قيمة محفوظة في settings.json تتفوق عليها.
import { SITE } from "./site";
import { db } from "./db";

export interface SiteSettings {
  siteName: string;
  tagline: string;
  announce: string;
  contactEmail: string;
  contactPhone: string;
  heroKicker: string;
  heroTitle: string;
  heroDesc: string;
}

export async function getSiteSettings(): Promise<SiteSettings> {
  let raw: Record<string, unknown> = {};
  try {
    const s = await db.settings();
    raw = (s || {}) as Record<string, unknown>;
  } catch { raw = {}; }
  const str = (v: unknown, fb: string) => (typeof v === "string" && v.trim() ? v : fb);
  return {
    siteName: str(raw["siteName"], SITE.name),
    tagline: str(raw["tagline"], SITE.tagline),
    announce: str(raw["announce"], "التقديم مفتوح 2026"),
    contactEmail: str(raw["contactEmail"], SITE.contact.email),
    contactPhone: str(raw["contactPhone"], SITE.contact.phone),
    heroKicker: str(raw["heroKicker"], "التقديم مفتوح 2026"),
    heroTitle: str(raw["heroTitle"], SITE.name),
    heroDesc: str(
      raw["heroDesc"],
      `${SITE.tagline} — منصة واحدة تجمع روح الجامعات والمعاهد: دورات، إجازات، تحفيظ، مهارات، وشهادات موثقة قابلة للتحقق.`
    ),
  };
}
