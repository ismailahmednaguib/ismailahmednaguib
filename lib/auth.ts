// lib/auth.ts : جلسة الدخول فقط — يقرأ الكوكي ويتحقق من التوكن
import { cookies, headers } from "next/headers";
import { readToken, SESSION_COOKIE } from "./security";
export async function currentUser(): Promise<{ email: string; role: string } | null> {
  const c = cookies().get(SESSION_COOKIE)?.value;
  if (!c) return null;
  return readToken(c);
}
export function clientIp(): string {
  const h = headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
}
export async function requireAdmin() {
  const u = await currentUser();
  if (!u || u.role !== "admin") throw new Error("غير مصرح");
  return u;
}
