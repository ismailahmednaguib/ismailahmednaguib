// app/api/password/route.ts : تغيير كلمة المرور — للإدمن (مع رسائل نجاح/خطأ للوحة)
import { NextResponse } from "next/server";
import { db, type UserRow } from "../../../lib/db";
import { checkPassword, hashPassword } from "../../../lib/security";
import { currentUser, clientIp } from "../../../lib/auth";
import { logPasswordChange } from "../../../lib/activity";

function back(req: Request, q: string) {
  return NextResponse.redirect(new URL(`/dashboard${q}#security`, req.url));
}

export async function POST(req: Request) {
  const u = await currentUser();
  if (!u || u.role !== "admin") return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  const form = await req.formData().catch(() => null);
  const raw: Record<string, unknown> = form
    ? Object.fromEntries((form as FormData).entries())
    : await req.json().catch(() => ({}));
  const old = String(raw["old"] || "");
  const nw = String(raw["nw"] || "");
  const nw2 = String(raw["nw2"] || "");

  if (!old) return form ? back(req, "?pw=err&reason=no_old") : NextResponse.json({ error: "أدخل الحالية" }, { status: 400 });
  if (nw.length < 10) return form ? back(req, "?pw=err&reason=short") : NextResponse.json({ error: "الجديدة قصيرة (10+)" }, { status: 400 });
  if (nw2 && nw !== nw2) return form ? back(req, "?pw=err&reason=mismatch") : NextResponse.json({ error: "تأكيد الجديدة غير متطابق" }, { status: 400 });
  if (nw === old) return form ? back(req, "?pw=err&reason=same") : NextResponse.json({ error: "الجديدة مثل الحالية" }, { status: 400 });

  const users = await db.users();
  const i = users.findIndex((x) => x.email === u.email);
  if (i < 0) return form ? back(req, "?pw=err&reason=nouser") : NextResponse.json({ error: "لا يوجد مستخدم" }, { status: 404 });
  if (!(await checkPassword(old, users[i].hash))) {
    return form ? back(req, "?pw=err&reason=wrong") : NextResponse.json({ error: "الحالية خطأ" }, { status: 401 });
  }
  users[i].hash = await hashPassword(nw);
  await db.write("users.json", users);
  await logPasswordChange(u.email, u.role, clientIp());
  if (form) return back(req, "?pw=ok");
  return NextResponse.json({ ok: true });
}