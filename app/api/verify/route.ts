// app/api/verify/route.ts : التحقق من الشهادة عبر API (عام)
import { NextResponse } from "next/server";
import { db } from "../../../lib/db";
import { cleanText } from "../../../lib/security";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = cleanText(searchParams.get("code") || "", 50);

  if (!code) {
    return NextResponse.json({ ok: false, error: "كود الشهادة مطلوب" }, { status: 400 });
  }

  const all = await db.certs().catch(() => []);
  const cert = all.find((c) => c.code === code) || null;

  if (!cert) {
    return NextResponse.json({ ok: false, error: "لا توجد شهادة بهذا الكود" }, { status: 404 });
  }

  return NextResponse.json({
    ok: true,
    certificate: {
      code: cert.code,
      student: cert.student,
      course: cert.course,
      date: cert.date,
      grade: cert.grade,
      verifyUrl: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/verify?code=${encodeURIComponent(cert.code)}`,
    },
  });
}