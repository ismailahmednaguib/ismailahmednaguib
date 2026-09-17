// app/api/forums/route.ts : إدارة المنتديات
import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { currentUser, requireAdmin } from "@/lib/auth";

async function getUserId(email: string): Promise<string | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data } = await sb.from("ian_users").select("id").eq("email", email).single();
  return data?.id || null;
}

// GET: قائمة المنتديات أو منتدى واحد مع المواضيع
export async function GET(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ ok: false, error: "غير مصرح" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const forumId = searchParams.get("id");
  const courseSlug = searchParams.get("course");
  const lessonId = searchParams.get("lesson");
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const limit = Math.min(Number(searchParams.get("limit")) || 20, 50);

  const sb = getSupabase();
  if (!sb) return NextResponse.json({ ok: false, error: "DB غير متاح" }, { status: 503 });

  // منتدى واحد مع المواضيع
  if (forumId) {
    const { data: forum, error: forumError } = await sb
      .from("ian_forums")
      .select("*")
      .eq("id", forumId)
      .single();

    if (forumError || !forum) return NextResponse.json({ ok: false, error: "المنتدى غير موجود" }, { status: 404 });

    // التحقق من الخصوصية
    if (forum.is_private) {
      const { data: enrollment } = await sb
        .from("ian_enrollments")
        .select("id")
        .eq("course_slug", forum.course_slug)
        .eq("user_id", (await getUserId(user.email)) || "")
        .single();

      if (!enrollment && user.role !== "admin") {
        return NextResponse.json({ ok: false, error: "هذا المنتدى للطلاب المسجلين فقط" }, { status: 403 });
      }
    }

    // جلب المواضيع
    const offset = (page - 1) * limit;
    const { data: topics, error: topicsError, count } = await sb
      .from("ian_forum_topics")
      .select("*, user:ian_users(email), last_reply_user:ian_users!ian_forum_topics_last_reply_by_fkey(email)", { count: "exact" })
      .eq("forum_id", forumId)
      .order("is_pinned", { ascending: false })
      .order("last_reply_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (topicsError) return NextResponse.json({ ok: false, error: topicsError.message }, { status: 500 });

    return NextResponse.json({ 
      ok: true, 
      forum,
      topics: topics || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      }
    });
  }

  // قائمة المنتديات لكورس أو درس
  let query = sb.from("ian_forums").select("*");
  
  if (courseSlug) query = query.eq("course_slug", courseSlug);
  if (lessonId) query = query.eq("lesson_id", lessonId);
  
  query = query.order("created_at", { ascending: false });

  const { data, error } = await query;
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, forums: data || [] });
}

// POST: إنشاء منتدى جديد (أدمن فقط)
export async function POST(req: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ ok: false, error: "غير مصرح" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const { course_slug, lesson_id, title, description, is_private } = body;

  if (!course_slug || !title) return NextResponse.json({ ok: false, error: "كورس وعنوان مطلوبان" }, { status: 400 });

  const sb = getSupabase();
  if (!sb) return NextResponse.json({ ok: false, error: "DB غير متاح" }, { status: 503 });

  const { data, error } = await sb
    .from("ian_forums")
    .insert({
      course_slug,
      lesson_id: lesson_id || null,
      title,
      description: description || "",
      is_private: is_private || false,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, forum: data });
}

// PUT: تحديث منتدى (أدمن فقط)
export async function PUT(req: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ ok: false, error: "غير مصرح" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const { id, ...updates } = body;
  if (!id) return NextResponse.json({ ok: false, error: "معرف المنتدى مطلوب" }, { status: 400 });

  const sb = getSupabase();
  if (!sb) return NextResponse.json({ ok: false, error: "DB غير متاح" }, { status: 503 });

  const { data, error } = await sb
    .from("ian_forums")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, forum: data });
}

// DELETE: حذف منتدى (أدمن فقط)
export async function DELETE(req: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ ok: false, error: "غير مصرح" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ ok: false, error: "معرف المنتدى مطلوب" }, { status: 400 });

  const sb = getSupabase();
  if (!sb) return NextResponse.json({ ok: false, error: "DB غير متاح" }, { status: 503 });

  const { error } = await sb.from("ian_forums").delete().eq("id", id);
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}