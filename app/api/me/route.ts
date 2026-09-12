// app/api/me/route.ts : بيانات المستخدم الحالي للرأس
import { NextResponse } from "next/server";
import { currentUser } from "../../../lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const u = await currentUser();
  if (!u) return NextResponse.json({ ok: false, user: null });
  return NextResponse.json({ ok: true, user: { email: u.email, role: u.role } });
}