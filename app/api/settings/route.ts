// app/api/settings/route.ts : قراءة الإعدادات (عام) + حفظها (أدمن فقط)
import { NextResponse } from "next/server";
import { db } from "../../../lib/db";
import { cleanText } from "../../../lib/security";
import { currentUser } from "../../../lib/auth";

export const dynamic = "force-dynamic";

const KEYS = ["siteName", "tagline", "announce", "contactEmail", "contactPhone", "heroKicker", "heroTitle", "heroDesc"] as const;

export async function GET() {
  const s = await db.settings().catch(() => ({}));
  return NextResponse.json({ ok: true, settings: s || {} });
}

export async function POST(req: Request) {
  const u = await currentUser();
  if (!u || u.role !== "admin") return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  const form = await req.formData().catch(() => null);
  const raw: Record<string, unknown> = form
    ? Object.fromEntries((form as FormData).entries())
    : await req.json().catch(() => ({}));
  const cur = ((await db.settings().catch(() => ({}))) || {}) as Record<string, unknown>;
  const next: Record<string, unknown> = { ...cur };
  for (const k of KEYS) {
    if (raw[k] !== undefined) next[k] = cleanText(String(raw[k] ?? ""), 500);
  }
  await db.write("settings.json", next);
  if (form) return NextResponse.redirect(new URL("/dashboard?settings=ok#site", req.url));
  return NextResponse.json({ ok: true, settings: next });
}
