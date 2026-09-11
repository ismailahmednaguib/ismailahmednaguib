// app/api/upload/route.ts : رفع الملفات — R2 أولا (ملفات كبيرة بلا حدود) ثم Supabase — للإدمن فقط
import { NextResponse } from "next/server";
import { getSupabase, FILES_BUCKET } from "../../../lib/supabase";
import { isR2Configured, uploadToR2 } from "../../../lib/r2";
import { currentUser } from "../../../lib/auth";

const MAX_MB = 100;
const ALLOWED = new Set([
  "application/pdf",
  "image/png", "image/jpeg", "image/webp", "image/gif",
  "audio/mpeg", "audio/mp4", "video/mp4",
]);

export async function POST(req: Request) {
  const u = await currentUser();
  if (!u || u.role !== "admin") return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  const form = await req.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: "لا يوجد ملف" }, { status: 400 });
  const f = form.get("file") as unknown as File | null;
  if (!f || typeof (f as File).arrayBuffer !== "function") return NextResponse.json({ error: "اختر ملفا أولا" }, { status: 400 });
  const file = f as File;
  if (file.size > MAX_MB * 1024 * 1024) return NextResponse.json({ error: `الملف كبير — الحد ${MAX_MB}MB` }, { status: 400 });
  if (file.type && !ALLOWED.has(file.type)) return NextResponse.json({ error: `نوع غير مدعوم: ${file.type}` }, { status: 400 });
  const buf = Buffer.from(await file.arrayBuffer());

  // 1) R2 أولا — الأفضل للملفات الكبيرة
  if (isR2Configured()) {
    try {
      const { url, key } = await uploadToR2(buf, file.name || "upload", file.type || "application/octet-stream");
      return NextResponse.json({ ok: true, url, key, via: "r2" });
    } catch (e) {
      return NextResponse.json({ error: "فشل الرفع على R2: " + String((e as Error).message || e) }, { status: 500 });
    }
  }

  // 2) Supabase Storage
  const sb = getSupabase();
  if (!sb) return NextResponse.json({ error: "التخزين غير مربوط — أضف R2 أو Supabase في Vercel" }, { status: 400 });
  const key = `ian/${Date.now()}-${(file.name || "upload").replace(/[^\w.\-]+/g, "_").slice(0, 100)}`;
  const { error: upErr } = await sb.storage.from(FILES_BUCKET).upload(key, buf, {
    contentType: file.type || "application/octet-stream",
    upsert: false,
  });
  if (upErr) return NextResponse.json({ error: "فشل الرفع: " + upErr.message + " — تأكد من إنشاء باكت ian-files" }, { status: 500 });
  const { data: pub } = sb.storage.from(FILES_BUCKET).getPublicUrl(key);
  let url = pub?.publicUrl || "";
  if (!url) {
    const { data: signed } = await sb.storage.from(FILES_BUCKET).createSignedUrl(key, 31536000);
    url = signed?.signedUrl || "";
  }
  return NextResponse.json({ ok: true, url, key, via: "supabase" });
}

