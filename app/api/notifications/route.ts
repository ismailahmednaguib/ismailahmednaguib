// app/api/notifications/route.ts : إشعارات المستخدم
import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { currentUser } from "@/lib/auth";

async function getUserId(email: string): Promise<string | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data } = await sb.from("ian_users").select("id").eq("email", email).single();
  return data?.id || null;
}

export async function GET(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ ok: false, error: "غير مصرح" }, { status: 401 });

  const userId = await getUserId(user.email);
  if (!userId) return NextResponse.json({ ok: false, error: "مستخدم غير موجود" }, { status: 404 });

  const { searchParams } = new URL(req.url);
  const unreadOnly = searchParams.get("unread") === "true";
  const limit = Math.min(Number(searchParams.get("limit")) || 50, 100);

  const sb = getSupabase();
  if (!sb) return NextResponse.json({ ok: false, error: "DB غير متاح" }, { status: 503 });

  let query = sb
    .from("ian_notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (unreadOnly) query = query.eq("read", false);

  const { data, error } = await query;
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, notifications: data || [] });
}

export async function POST(req: Request) {
  const user = await currentUser();
  if (!user || user.role !== "admin") return NextResponse.json({ ok: false, error: "غير مصرح" }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const { userId, type, title, message, link } = body;
  if (!userId || !title) return NextResponse.json({ ok: false, error: "بيانات ناقصة" }, { status: 400 });

  const sb = getSupabase();
  if (!sb) return NextResponse.json({ ok: false, error: "DB غير متاح" }, { status: 503 });

  const { data, error } = await sb
    .from("ian_notifications")
    .insert({
      user_id: userId,
      type: type || "info",
      title,
      message: message || "",
      link: link || null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, notification: data });
}

export async function PUT(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ ok: false, error: "غير مصرح" }, { status: 401 });

  const userId = await getUserId(user.email);
  if (!userId) return NextResponse.json({ ok: false, error: "مستخدم غير موجود" }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const { id, read } = body;
  if (!id || typeof read !== "boolean") return NextResponse.json({ ok: false, error: "بيانات ناقصة" }, { status: 400 });

  const sb = getSupabase();
  if (!sb) return NextResponse.json({ ok: false, error: "DB غير متاح" }, { status: 503 });

  const { error } = await sb
    .from("ian_notifications")
    .update({ read })
    .eq("id", id)
    .eq("user_id", userId);

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ ok: false, error: "غير مصرح" }, { status: 401 });

  const userId = await getUserId(user.email);
  if (!userId) return NextResponse.json({ ok: false, error: "مستخدم غير موجود" }, { status: 404 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const allRead = searchParams.get("allRead") === "true";

  const sb = getSupabase();
  if (!sb) return NextResponse.json({ ok: false, error: "DB غير متاح" }, { status: 503 });

  if (allRead) {
    const { error } = await sb.from("ian_notifications").delete().eq("user_id", userId).eq("read", true);
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  if (!id) return NextResponse.json({ ok: false, error: "معرف الإشعار مطلوب" }, { status: 400 });

  const { error } = await sb.from("ian_notifications").delete().eq("id", id).eq("user_id", userId);
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}