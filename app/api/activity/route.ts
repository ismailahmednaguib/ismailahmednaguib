// app/api/activity/route.ts : قراءة سجل النشاطات (أدمن فقط)
import { NextResponse } from "next/server";
import { db } from "../../../lib/db";
import { currentUser } from "../../../lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const u = await currentUser();
  if (!u || u.role !== "admin") return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  const activities = await db.read<import("../../../lib/activity").ActivityEntry[]>("activity.json", []);
  return NextResponse.json({ ok: true, activities: activities.slice(0, 500) });
}