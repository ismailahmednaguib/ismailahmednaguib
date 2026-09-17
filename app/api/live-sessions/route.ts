// app/api/live-sessions/route.ts : إدارة الجلسات المباشرة
import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { currentUser, requireAdmin } from "@/lib/auth";

async function getUserId(email: string): Promise<string | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data } = await sb.from("ian_users").select("id").eq("email", email).single();
  return data?.id || null;
}

// GET: قائمة الجلسات المباشرة
export async function GET(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ ok: false, error: "غير مصرح" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("id");
  const courseSlug = searchParams.get("course");
  const status = searchParams.get("status");
  const upcoming = searchParams.get("upcoming") === "true";

  const sb = getSupabase();
  if (!sb) return NextResponse.json({ ok: false, error: "DB غير متاح" }, { status: 503 });

  // جلسة واحدة مع التفاصيل
  if (sessionId) {
    const { data: session, error } = await sb
      .from("ian_live_sessions")
      .select("*")
      .eq("id", sessionId)
      .single();

    if (error || !session) return NextResponse.json({ ok: false, error: "الجلسة غير موجودة" }, { status: 404 });

    // جلب المشاركين
    const { data: participants } = await sb
      .from("ian_live_participants")
      .select("*, user:ian_users(email)")
      .eq("session_id", sessionId);

    // التحقق من مشاركة المستخدم
    const userId = await getUserId(user.email);
    let userParticipant = null;
    if (userId) {
      const { data } = await sb
        .from("ian_live_participants")
        .select("*")
        .eq("session_id", sessionId)
        .eq("user_id", userId)
        .single();
      userParticipant = data;
    }

    return NextResponse.json({ 
      ok: true, 
      session,
      participants: participants || [],
      userParticipant,
      canJoin: userParticipant || user.role === "admin" || session.host_email === user.email,
    });
  }

  // قائمة الجلسات
  let query = sb.from("ian_live_sessions").select("*");
  
  if (courseSlug) query = query.eq("course_slug", courseSlug);
  if (status) query = query.eq("status", status);
  if (upcoming) query = query.gte("scheduled_at", new Date().toISOString());
  
  // للمستخدم العادي: يرى جلساته فقط أو الجلسات العامة
  if (user.role !== "admin") {
    query = query.or(`host_email.eq.${user.email},status.eq.scheduled`);
  }
  
  query = query.order("scheduled_at", { ascending: upcoming });

  const { data, error } = await query;
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, sessions: data || [] });
}

// POST: إنشاء جلسة مباشرة جديدة (أدمن/معلم)
export async function POST(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ ok: false, error: "غير مصرح" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { course_slug, lesson_id, title, description, provider, meeting_url, meeting_id, meeting_password, scheduled_at, duration, max_participants } = body;

  if (!course_slug || !title || !scheduled_at) {
    return NextResponse.json({ ok: false, error: "كورس، عنوان، ووقت مطلوبان" }, { status: 400 });
  }

  const sb = getSupabase();
  if (!sb) return NextResponse.json({ ok: false, error: "DB غير متاح" }, { status: 503 });

  // توليد meeting_id للجيتسي إذا لم يتم توفيره
  const genMeetingId = meeting_id || `ian-${course_slug}-${Date.now().toString(36)}`.replace(/[^a-z0-9-]/g, '');

  const { data, error } = await sb
    .from("ian_live_sessions")
    .insert({
      course_slug,
      lesson_id: lesson_id || null,
      title,
      description: description || "",
      provider: provider || "jitsi",
      meeting_url: meeting_url || null,
      meeting_id: genMeetingId,
      meeting_password: meeting_password || null,
      scheduled_at,
      duration: duration || 60,
      max_participants: max_participants || 100,
      status: "scheduled",
      host_email: user.email,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, session: data });
}

// PUT: تحديث جلسة (المضيف أو أدمن)
export async function PUT(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ ok: false, error: "غير مصرح" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { id, ...updates } = body;
  if (!id) return NextResponse.json({ ok: false, error: "معرف الجلسة مطلوب" }, { status: 400 });

  const sb = getSupabase();
  if (!sb) return NextResponse.json({ ok: false, error: "DB غير متاح" }, { status: 503 });

  // التحقق من الصلاحية
  const { data: session } = await sb.from("ian_live_sessions").select("host_email").eq("id", id).single();
  if (!session) return NextResponse.json({ ok: false, error: "الجلسة غير موجودة" }, { status: 404 });
  if (session.host_email !== user.email && user.role !== "admin") {
    return NextResponse.json({ ok: false, error: "غير مصرح" }, { status: 403 });
  }

  const { data, error } = await sb
    .from("ian_live_sessions")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, session: data });
}

// DELETE: حذف جلسة (المضيف أو أدمن)
export async function DELETE(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ ok: false, error: "غير مصرح" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ ok: false, error: "معرف الجلسة مطلوب" }, { status: 400 });

  const sb = getSupabase();
  if (!sb) return NextResponse.json({ ok: false, error: "DB غير متاح" }, { status: 503 });

  const { data: session } = await sb.from("ian_live_sessions").select("host_email").eq("id", id).single();
  if (!session) return NextResponse.json({ ok: false, error: "الجلسة غير موجودة" }, { status: 404 });
  if (session.host_email !== user.email && user.role !== "admin") {
    return NextResponse.json({ ok: false, error: "غير مصرح" }, { status: 403 });
  }

  const { error } = await sb.from("ian_live_sessions").delete().eq("id", id);
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}