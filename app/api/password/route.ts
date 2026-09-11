// app/api/password/route.ts : تغيير كلمة المرور فقط — للإدمن
import { NextResponse } from "next/server";
import { db } from "../../../lib/db";
import { checkPassword, hashPassword } from "../../../lib/security";
import { currentUser } from "../../../lib/auth";

interface UserRow { email: string; hash: string; role: string; }

export async function POST(req: Request) {
  const u = await currentUser();
  if (!u || u.role !== "admin") return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  const form = await req.formData().catch(() => null);
  const raw: Record<string, unknown> = form
    ? Object.fromEntries((form as FormData).entries())
    : await req.json().catch(() => ({}));
  const old = String(raw["old"] || "");
  const nw = String(raw["nw"] || "");
  if (nw.length < 10) return NextResponse.json({ error: "الجديدة قصيرة (10+)" }, { status: 400 });
  const users = await db.read<UserRow[]>("users.json", []);
  const i = users.findIndex((x) => x.email === u.email);
  if (i < 0) return NextResponse.json({ error: "لا يوجد مستخدم" }, { status: 404 });
  if (!(await checkPassword(old, users[i].hash))) return NextResponse.json({ error: "الحالية خطأ" }, { status: 401 });
  users[i].hash = await hashPassword(nw);
  await db.write("users.json", users);
  if (form) return NextResponse.redirect(new URL("/dashboard#security", req.url));
  return NextResponse.json({ ok: true });
}

