// lib/security.ts : الحماية من التسريب والحقن — ملف مستقل (بدون اعتماديات خارجية ثقيلة)
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";

const secret = new TextEncoder().encode(process.env.JWT_SECRET || "dev-only-change-me-please-64-chars-long-secret-key-1234567890");
export const SESSION_COOKIE = "ian_session";

export async function hashPassword(pw: string) { return bcrypt.hash(pw, 12); }
export async function checkPassword(pw: string, hash: string) { return bcrypt.compare(pw, hash); }

// تنظيف النصوص: إزالة أي وسوم HTML + قص الطول + إزالة المسافات
// العرض يتم عبر React JSX الذي يهرّب المحارف تلقائيا، فلا حاجة لمكتبة خارجية
export function cleanText(s: string, max = 2000) {
  let t = String(s || "").slice(0, max);
  t = t.replace(/<[^>]*>/g, "");
  t = t.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "");
  return t.trim();
}

// تنظيف الروابط: السماح فقط بـ https/http أو مسار داخلي أو # أو فارغ — يمنع javascript: و data:
export function cleanUrl(s: string, max = 2000) {
  const t = cleanText(s, max);
  if (!t) return "";
  if (t.startsWith("/") || t.startsWith("#")) return t;
  try {
    const u = new URL(t);
    if (u.protocol === "https:" || u.protocol === "http:") return u.toString().slice(0, max);
    return "";
  } catch {
    return "";
  }
}

export async function makeToken(payload: { email: string; role: string }) {
  return new SignJWT(payload).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("12h").sign(secret);
}
export async function readToken(token: string) {
  try { const { payload } = await jwtVerify(token, secret); return payload as { email: string; role: string }; }
  catch { return null; }
}

// منع تخمين الدخول: عداد بسيط في الذاكرة
const tries = new Map<string, { n: number; until: number }>();
export function loginAllowed(ip: string): boolean {
  const r = tries.get(ip); if (!r) return true;
  if (Date.now() > r.until) { tries.delete(ip); return true; }
  return r.n < 5;
}
export function loginFailed(ip: string) {
  const r = tries.get(ip) || { n: 0, until: Date.now() + 15 * 60 * 1000 };
  r.n += 1; tries.set(ip, r);
}
export function loginOk(ip: string) { tries.delete(ip); }

