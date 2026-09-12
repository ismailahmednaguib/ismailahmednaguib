// app/api/admin/users/route.ts : إضافة/تعديل/حذف المستخدمين من اللوحة
import { NextResponse } from "next/server";
import { db, type UserRow } from "../../../lib/db";
import { hashPassword, checkPassword, cleanText } from "../../../lib/security";
import { currentUser, clientIp } from "../../../lib/auth";
import { randomUUID } from "crypto";
import { logAdd, logEdit, logDelete, logRoleChange, logPasswordChange, logEmailChange } from "../../../lib/activity";

export async function GET() {
  const u = await currentUser();
  if (!u || u.role !== "admin") return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  const users = await db.users();
  return NextResponse.json({ ok: true, users: users.map((x) => ({ email: x.email, role: x.role })) });
}

export async function POST(req: Request) {
  const u = await currentUser();
  if (!u || u.role !== "admin") return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  const body = await req.json().catch(() => ({}));
  const email = cleanText(String(body.email || "").toLowerCase(), 120);
  const password = String(body.password || "");
  const role = body.role === "teacher" ? "teacher" : body.role === "student" ? "student" : "admin";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return NextResponse.json({ error: "بريد غير صحيح" }, { status: 400 });
  if (password.length < 10) return NextResponse.json({ error: "كلمة المرور قصيرة (10+)" }, { status: 400 });
  const users = await db.users();
  if (users.some((x) => x.email === email)) return NextResponse.json({ error: "البريد مستخدم" }, { status: 400 });
  const hash = await hashPassword(password);
  users.push({ email, hash, role });
  await db.write("users.json", users);
  await logAdd("users", email, `مستخدم جديد: ${email} (${role})`, u.email, u.role, clientIp(req));
  return NextResponse.json({ ok: true, user: { email, role } });
}

export async function PUT(req: Request) {
  const u = await currentUser();
  if (!u || u.role !== "admin") return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  const body = await req.json().catch(() => ({}));
  const email = cleanText(String(body.email || "").toLowerCase(), 120);
  const newEmail = cleanText(String(body.newEmail || "").toLowerCase(), 120);
  const role = body.role === "teacher" ? "teacher" : body.role === "student" ? "student" : "admin";
  const password = String(body.password || "");
  if (email === u.email && role !== u.role) return NextResponse.json({ error: "لا يمكن تغيير دورك الخاص" }, { status: 400 });
  const users = await db.users();
  const i = users.findIndex((x) => x.email === email);
  if (i < 0) return NextResponse.json({ error: "المستخدم غير موجود" }, { status: 404 });
  const oldRole = users[i].role;
  const oldEmail = users[i].email;
  if (newEmail && newEmail !== email) {
    if (users.some((x) => x.email === newEmail)) return NextResponse.json({ error: "البريد الجديد مستخدم" }, { status: 400 });
    if (password && !(await checkPassword(password, users[i].hash))) return NextResponse.json({ error: "كلمة المرور الحالية خطأ" }, { status: 401 });
    users[i].email = newEmail;
    await logEmailChange(oldEmail, newEmail, u.email, u.role, clientIp(req));
  }
  if (role && role !== oldRole) {
    users[i].role = role;
    await logRoleChange(email, role, u.email, u.role, clientIp(req));
  }
  if (password && password.length >= 10) {
    if (!(await checkPassword(password, users[i].hash))) return NextResponse.json({ error: "كلمة المرور الحالية خطأ" }, { status: 401 });
    users[i].hash = await hashPassword(password);
    await logPasswordChange(users[i].email, u.email, u.role, clientIp(req));
  }
  await db.write("users.json", users);
  await logEdit("users", users[i].email, `مستخدم: ${users[i].email}`, u.email, u.role, `تعديل بيانات المستخدم`, clientIp(req));
  return NextResponse.json({ ok: true, user: { email: users[i].email, role: users[i].role } });
}

export async function DELETE(req: Request) {
  const u = await currentUser();
  if (!u || u.role !== "admin") return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  const email = new URL(req.url).searchParams.get("email") || "";
  if (email === u.email) return NextResponse.json({ error: "لا يمكن حذف حسابك الخاص" }, { status: 400 });
  const users = await db.users();
  const kept = users.filter((x) => x.email !== email);
  if (kept.length === users.length) return NextResponse.json({ error: "المستخدم غير موجود" }, { status: 404 });
  await db.write("users.json", kept);
  await logDelete("users", email, `مستخدم: ${email}`, u.email, u.role, clientIp(req));
  return NextResponse.json({ ok: true });
}