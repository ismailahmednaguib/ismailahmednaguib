// app/api/email/route.ts : تغيير بريد الإدمن — بتأكيد كلمة المرور + إصدار جلسة جديدة
import { NextResponse } from "next/server";
import { db } from "../../../lib/db";
import { checkPassword, cleanText, makeToken, SESSION_COOKIE } from "../../../lib/security";
import { cookieOpts } from "../../../lib/cookies";
import { currentUser, clientIp } from "../../../lib/auth";
import { logEmailChange } from "../../../lib/activity";

function back(req: Request, q: string) {
  return NextResponse.redirect(new URL(`/dashboard${q}#security`, req.url));
}

function validEmail(e: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e);
}

export async function POST(req: Request) {
  const u = await currentUser();
  if (!u || u.role !== "admin") return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  const form = await req.formData().catch(() => null);
  const raw: Record<string, unknown> = form
    ? Object.fromEntries((form as FormData).entries())
    : await req.json().catch(() => ({}));
  const newEmail = cleanText(String(raw["newEmail"] || "").toLowerCase(), 120);
  const password = String(raw["password"] || "");

  if (!newEmail || !validEmail(newEmail)) {
    return form ? back(req, "?em=err&reason=bad") : NextResponse.json({ error: "بريد غير صالح" }, { status: 400 });
  }
  if (newEmail === u.email) {
    return form ? back(req, "?em=err&reason=same") : NextResponse.json({ error: "نفس البريد الحالي" }, { status: 400 });
  }
  const users = await db.users();
  if (users.some((x) => x.email === newEmail)) {
    return form ? back(req, "?em=err&reason=exists") : NextResponse.json({ error: "البريد مستخدم" }, { status: 400 });
  }
  const i = users.findIndex((x) => x.email === u.email);
  if (i < 0) return form ? back(req, "?em=err&reason=nouser") : NextResponse.json({ error: "لا يوجد مستخدم" }, { status: 404 });
  if (!password || !(await checkPassword(password, users[i].hash))) {
    return form ? back(req, "?em=err&reason=wrong") : NextResponse.json({ error: "كلمة المرور خطأ" }, { status: 401 });
  }
  const oldEmail = users[i].email;
  users[i].email = newEmail;
  await db.write("users.json", users);
  await logEmailChange(oldEmail, newEmail, u.email, u.role, clientIp());
  const token = await makeToken({ email: newEmail, role: users[i].role });
  if (form) {
    const res = back(req, "?em=ok");
    res.cookies.set(SESSION_COOKIE, token, cookieOpts(req));
    return res;
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, token, cookieOpts(req));
  return res;
}