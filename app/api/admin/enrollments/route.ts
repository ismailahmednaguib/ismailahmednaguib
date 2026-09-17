// app/api/admin/enrollments/route.ts : إدارة تسجيلات الطلاب (أدمن فقط)
import { NextResponse } from "next/server";
import { db } from "../../../../lib/db";
import { currentUser, clientIp } from "../../../../lib/auth";
import { logDelete } from "../../../../lib/activity";

export const dynamic = "force-dynamic";

export async function GET() {
  const u = await currentUser();
  if (!u || u.role !== "admin") return NextResponse.json({ error: "غير مصرح" }, { status: 403 });

  const enrollments = await db.read<import("../../../../lib/enrollment").Enrollment[]>("enrollments.json", []);
  return NextResponse.json({ ok: true, enrollments });
}

export async function DELETE(req: Request) {
  const u = await currentUser();
  if (!u || u.role !== "admin") return NextResponse.json({ error: "غير مصرح" }, { status: 403 });

  const id = new URL(req.url).searchParams.get("id") || "";
  if (!id) return NextResponse.json({ error: "معرّف مطلوب" }, { status: 400 });

  const all = await db.read<import("../../../../lib/enrollment").Enrollment[]>("enrollments.json", []);
  const existing = all.find(e => e.id === id);
  if (!existing) return NextResponse.json({ error: "غير موجود" }, { status: 404 });

  const kept = all.filter(e => e.id !== id);
  await db.write("enrollments.json", kept);
  await logDelete("enrollments", id, `تسجيل: ${existing.studentEmail} - ${existing.courseSlug}`, u.email, u.role, clientIp());

  return NextResponse.json({ ok: true });
}