// lib/site-settings.ts : كل نصوص الموقع من لوحة التحكم — ملف مستقل
// أي كلمة ظاهرة للزوار تأتي من هنا، والقيم الافتراضية من lib/site.ts
import { SITE } from "./site";
import { db } from "./db";

export interface SiteSettings {
  siteName: string; tagline: string; announce: string;
  contactEmail: string; contactPhone: string;
  heroKicker: string; heroTitle: string; heroDesc: string;
  footerAbout: string; footerRights: string;
  coursesTitle: string; coursesDesc: string;
  libraryTitle: string; libraryDesc: string;
  quranTitle: string; quranDesc: string;
  scholarsTitle: string; scholarsDesc: string;
  fatwaTitle: string; fatwaDesc: string;
  newsTitle: string; newsDesc: string;
  verifyTitle: string; verifyDesc: string;
  admissionTitle: string; admissionDesc: string;
  admissionOkTitle: string; admissionOkDesc: string;
  emptyCourses: string; emptyBooks: string; emptyNews: string;
  certTitle: string; certSubtitle: string; certFooter: string;
  certSignName: string; certSignTitle: string;
  loginTitle: string; loginDesc: string;
}

const DEFAULTS: SiteSettings = {
  siteName: SITE.name,
  tagline: SITE.tagline,
  announce: "التقديم مفتوح",
  contactEmail: SITE.contact.email,
  contactPhone: SITE.contact.phone,
  heroKicker: "التقديم مفتوح",
  heroTitle: SITE.name,
  heroDesc: `${SITE.tagline} — منصة واحدة تجمع روح الجامعات والمعاهد: دورات، إجازات، تحفيظ، مهارات، وشهادات موثقة قابلة للتحقق.`,
  footerAbout: `${SITE.tagline}. تعلم عن بعد، إجازات مسندة، شهادات موثقة.`,
  footerRights: "جميع الحقوق محفوظة",
  coursesTitle: "الدورات والمسارات",
  coursesDesc: "اختر مسارك: شرعي • تدريبي • قرآني • جامعي مصغر",
  libraryTitle: "المكتبة",
  libraryDesc: "كتب ومتون PDF للتحميل والقراءة — تضاف من لوحة التحكم",
  quranTitle: "المدرسة القرآنية",
  quranDesc: "تحفيظ وتجويد وإجازات مسندة وحلقات مباشرة",
  scholarsTitle: "العلماء والمشايخ",
  scholarsDesc: "هيئة التدريس والإشراف العلمي",
  fatwaTitle: "الفتاوى والاستشارات",
  fatwaDesc: "إجابات موثقة من المشايخ",
  newsTitle: "الأخبار والإعلانات",
  newsDesc: "جديد المنصة والمسارات",
  verifyTitle: "التحقق من الشهادة",
  verifyDesc: "أدخل كود الشهادة الموجود على شهادتك للتأكد من صحتها",
  admissionTitle: "التقديم والالتحاق",
  admissionDesc: "املأ الاستمارة وسيتواصل معك المشرف",
  admissionOkTitle: "تم استلام طلبك بنجاح",
  admissionOkDesc: "سيتواصل معك المشرف قريبا. احتفظ برقم هاتفك متاحا.",
  emptyCourses: "لا توجد دورات بعد — أضف من لوحة التحكم.",
  emptyBooks: "لا توجد كتب بعد — أضف من لوحة التحكم.",
  emptyNews: "لا توجد أخبار بعد.",
  certTitle: "شهادة إتمام",
  certSubtitle: "تشهد المنصة بأن",
  certFooter: "هذه الشهادة موثقة ويمكن التحقق منها بالكود أدناه",
  certSignName: "إدارة المنصة",
  certSignTitle: "التوقيع والختم",
  loginTitle: "دخول الإدارة",
  loginDesc: "خاص بإدارة المنصة فقط",
};

export async function getSiteSettings(): Promise<SiteSettings> {
  let raw: Record<string, unknown> = {};
  try {
    const s = await db.settings();
    raw = (s || {}) as Record<string, unknown>;
  } catch { raw = {}; }
  const out: Record<string, string> = { ...(DEFAULTS as unknown as Record<string, string>) };
  for (const k of Object.keys(DEFAULTS) as (keyof SiteSettings)[]) {
    const v = raw[k as string];
    if (typeof v === "string" && v.trim()) out[k as string] = v;
  }
  return out as unknown as SiteSettings;
}

export const SITE_KEYS = Object.keys(DEFAULTS) as (keyof SiteSettings)[];

