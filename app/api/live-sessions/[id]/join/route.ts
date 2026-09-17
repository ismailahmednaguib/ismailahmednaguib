// app/api/live-sessions/[id]/join/route.ts : الانضمام للجلسة المباشرة
import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { currentUser } from "@/lib/auth";

async function getUserId(email: string): Promise<string | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data } = await sb.from("ian_users").select("id").eq("email", email).single();
  return data?.id || null;
}

// POST: الانضمام للجلسة
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ ok: false, error: "غير مصرح" }, { status: 401 });

  const { id } = await params;
  const sb = getSupabase();
  if (!sb) return NextResponse.json({ ok: false, error: "DB غير متاح" }, { status: 503 });

  const userId = await getUserId(user.email);
  if (!userId) return NextResponse.json({ ok: false, error: "مستخدم غير موجود" }, { status: 404 });

  // جلب الجلسة
  const { data: session, error: sessionError } = await sb
    .from("ian_live_sessions")
    .select("*")
    .eq("id", id)
    .single();

  if (sessionError || !session) return NextResponse.json({ ok: false, error: "الجلسة غير موجودة" }, { status: 404 });

  // التحقق من الحالة
  if (session.status === "cancelled") {
    return NextResponse.json({ ok: false, error: "تم إلغاء الجلسة" }, { status: 400 });
  }

  // التحقق من عدد المشاركين
  const { count } = await sb
    .from("ian_live_participants")
    .select("id", { count: "exact", head: true })
    .eq("session_id", id);

  if (count && count >= session.max_participants) {
    return NextResponse.json({ ok: false, error: "الجلسة ممتلئة" }, { status: 400 });
  }

  // إضافة/تحديث المشارك
  const { data: participant, error: participantError } = await sb
    .from("ian_live_participants")
    .upsert({
      session_id: id,
      user_id: userId,
      joined_at: new Date().toISOString(),
      role: session.host_email === user.email ? "host" : "participant",
    }, { onConflict: "session_id,user_id" })
    .select()
    .single();

  if (participantError) return NextResponse.json({ ok: false, error: participantError.message }, { status: 500 });

  // إنشاء رابط الجيتسي
  let joinUrl = session.meeting_url;
  if (session.provider === "jitsi" && session.meeting_id) {
    const baseUrl = process.env.JITSI_BASE_URL || "https://meet.jit.si";
    const password = session.meeting_password ? `#${session.meeting_password}` : "";
    joinUrl = `${baseUrl}/${session.meeting_id}${password}`;
  }

  return NextResponse.json({ 
    ok: true, 
    participant,
    joinUrl,
    session: {
      id: session.id,
      title: session.title,
      provider: session.provider,
      meeting_id: session.meeting_id,
      meeting_password: session.meeting_password,
      scheduled_at: session.scheduled_at,
      duration: session.duration,
    }
  });
}

// DELETE: مغادرة الجلسة
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ ok: false, error: "غير مصرح" }, { status: 401 });

  const { id } = await params;
  const sb = getSupabase();
  if (!sb) return NextResponse.json({ ok: false, error: "DB غير متاح" }, { status: 503 });

  const userId = await getUserId(user.email);
  if (!userId) return NextResponse.json({ ok: false, error: "مستخدم غير موجود" }, { status: 404 });

  // تحديث وقت المغادرة
  const { data: participant } = await sb
    .from("ian_live_participants")
    .select("joined_at")
    .eq("session_id", id)
    .eq("user_id", userId)
    .single();

  if (participant) {
    const joinedAt = new Date(participant.joined_at).getTime();
    const leftAt = new Date().getTime();
    const duration = Math.round((leftAt - joinedAt) / 1000);

    await sb
      .from("ian_live_participants")
      .update({ left_at: new Date().toISOString(), duration })
      .eq("session_id", id)
      .eq("user_id", userId);
  }

  return NextResponse.json({ ok: true });
}