// app/api/admin/files/route.ts : قائمة الملفات المرفقة + حذف من التخزين السحابي
import { NextResponse } from "next/server";
import { getSupabase, FILES_BUCKET } from "../../../lib/supabase";
import { isR2Configured, listR2, deleteR2 } from "../../../lib/r2";
import { currentUser } from "../../../lib/auth";

export async function GET() {
  const u = await currentUser();
  if (!u || u.role !== "admin") return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  const files: { key: string; name: string; size: number; type: string; url: string }[] = [];
  if (isR2Configured()) {
    try {
      const list = await listR2();
      for (const it of list) {
        files.push({ key: it.key, name: it.key.split("/").pop() || it.key, size: it.size, type: "", url: "" });
      }
    } catch { /* ignore */ }
  }
  const sb = getSupabase();
  if (sb) {
    try {
      const { data, error } = await sb.storage.from(FILES_BUCKET).list(undefined, { limit: 200, sortBy: { column: "created_at", order: "desc" } });
      if (!error && data) {
        for (const f of data) {
          const { data: pub } = sb.storage.from(FILES_BUCKET).getPublicUrl(f.name);
          files.push({ key: f.name, name: f.name, size: f.metadata?.size || 0, type: f.metadata?.mimetype || "", url: pub?.publicUrl || "" });
        }
      }
    } catch { /* ignore */ }
  }
  return NextResponse.json({ ok: true, files });
}

export async function DELETE(req: Request) {
  const u = await currentUser();
  if (!u || u.role !== "admin") return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  const key = new URL(req.url).searchParams.get("key") || "";
  if (!key) return NextResponse.json({ error: "مفتاح الملف مطلوب" }, { status: 400 });
  if (isR2Configured()) {
    try { await deleteR2(key); return NextResponse.json({ ok: true }); } catch { /* fallthrough */ }
  }
  const sb = getSupabase();
  if (sb) {
    const { error } = await sb.storage.from(FILES_BUCKET).remove([key]);
    if (!error) return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ error: "تعذر الحذف" }, { status: 500 });
}