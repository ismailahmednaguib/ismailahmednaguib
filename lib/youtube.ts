// lib/youtube.ts : مساعدات يوتيوب — ملف مستقل
// الفيديوهات ترفع على يوتيوب (غير مدرج) مجانا بلا حدود، ونخزن الرابط فقط.

export function extractYoutubeId(url: string): string | null {
  const u = (url || "").trim();
  if (!u) return null;
  let m = u.match(/youtu\.be\/([\w-]{6,})/);
  if (m) return m[1];
  m = u.match(/[?&]v=([\w-]{6,})/);
  if (m) return m[1];
  m = u.match(/shorts\/([\w-]{6,})/);
  if (m) return m[1];
  m = u.match(/\/embed\/([\w-]{6,})/);
  if (m) return m[1];
  m = u.match(/\/live\/([\w-]{6,})/);
  if (m) return m[1];
  return null;
}

export function youtubeEmbed(url: string): string | null {
  if (!url) return null;
  const u = url.trim();
  if (u.includes("/embed/")) return u;
  const id = extractYoutubeId(u);
  if (id) return `https://www.youtube.com/embed/${id}`;
  if (u.includes("youtube.com") || u.includes("youtu.be")) return u;
  return u; // ملف مباشر mp4
}

export function youtubeThumb(url: string): string | null {
  const id = extractYoutubeId(url || "");
  if (!id) return null;
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}

export function isYoutube(url: string): boolean {
  return extractYoutubeId(url || "") !== null;
}
