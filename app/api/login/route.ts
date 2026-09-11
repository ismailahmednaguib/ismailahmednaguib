// app/api/login/route.ts : الدخول فقط — ضد التخمين + توكن آمن
import { NextResponse } from "next/server";
import { db } from "../../../lib/db";
import { checkPassword, cleanText, hashPassword, loginAllowed, loginFailed, loginOk, makeToken, SESSION_COOKIE } from "../../../lib/security";
import { clientIp } from "../../../lib/auth";

const FIRST_ADMIN = { email: "admin@ian.local", pass: "IanAdmin123!" };

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

  const users = await db.read<{ email: string; hash: string; role: string }[]>("users.json", []);
  let admin = users.find((u) => u.email === email);
  if (!admin && email === FIRST_ADMIN.email) {
    admin = { email, hash: await hashPassword(FIRST_ADMIN.pass), role: "admin" };
    users.push(admin);
    await db.write("users.json", users);
  }
  if (!admin || !(await checkPassword(password, admin.hash))) {
    loginFailed(ip);
    if (isForm) return NextResponse.redirect(new URL("/login?err=1", req.url));
    return NextResponse.json({ error: "بيانات الدخول غير صحيحة" }, { status: 401 });
  }
  loginOk(ip);
  const token = await makeToken({ email: admin.email, role: admin.role });
  if (isForm) {
    const res = NextResponse.redirect(new URL("/dashboard", req.url));
    res.cookies.set(SESSION_COOKIE, token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 43200 });
    return res;
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 43200 });
  return res;
}


