// app/api/login/route.ts : الدخول فقط — ضد التخمين + توكن آمن
// ملاحظة أمان: لا يوجد أي حساب افتراضي هنا. الأدمن ينشأ فقط عبر supabase/set-admin.sql
import { NextResponse } from "next/server";
import { db } from "../../../lib/db";
import { checkPassword, cleanText, loginAllowed, loginFailed, loginOk, makeToken, SESSION_COOKIE } from "../../../lib/security";
import { cookieOpts } from "../../../lib/cookies";
import { clientIp } from "../../../lib/auth";
import { logLogin } from "../../../lib/activity";

export async function POST(req: Request) {
  const ip = clientIp();
  if (!loginAllowed(ip)) {
    return NextResponse.json({ error: "محاولات كثيرة — انتظر 15 دقيقة" }, { status: 429 });
  }
  const form = await req.formData().catch(() => null);
  const isForm = !!form;
  const body: Record<string, unknown> = form
    ? Object.fromEntries((form as FormData).entries())
    : await req.json().catch(() => ({}));
  const email = cleanText(String(body["email"] || "").toLowerCase(), 120);
  const password = String(body["password"] || "");
  const locale = String(body["locale"] || "") === "en" ? "en" : "ar";

  const users = await db.users();
  const admin = users.find((u) => u.email === email);
  if (!admin || !(await checkPassword(password, admin.hash))) {
    loginFailed(ip);
    if (isForm) return NextResponse.redirect(new URL(`/${locale}/login?err=1`, req.url));
    return NextResponse.json({ error: "بيانات الدخول غير صحيحة" }, { status: 401 });
  }
  loginOk(ip);
  await logLogin(admin.email, admin.role, ip);
  const token = await makeToken({ email: admin.email, role: admin.role });
  if (isForm) {
    const res = NextResponse.redirect(new URL(`/${locale}/dashboard`, req.url));
    res.cookies.set(SESSION_COOKIE, token, cookieOpts(req));
    return res;
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, token, cookieOpts(req));
  return res;
}
