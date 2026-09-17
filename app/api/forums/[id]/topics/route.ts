// app/api/forums/[id]/topics/route.ts : إدارة مواضيع المنتدى
import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { currentUser, requireAdmin } from "@/lib/auth";

async function getUserId(email: string): Promise<string | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data } = await sb.from("ian_users").select("id").eq("email", email).single();
  return data?.id || null;
}

// GET: قائمة مواضيع المنتدى
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ ok: false, error: "غير مصرح" }, { status: 401 });

  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const topicId = searchParams.get("topicId");
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const limit = Math.min(Number(searchParams.get("limit")) || 20, 50);

  const sb = getSupabase();
  if (!sb) return NextResponse.json({ ok: false, error: "DB غير متاح" }, { status: 503 });

  // موضوع واحد مع الردود
  if (topicId) {
    const { data: topic, error: topicError } = await sb
      .from("ian_forum_topics")
      .select("*, user:ian_users(email), last_reply_user:ian_users!ian_forum_topics_last_reply_by_fkey(email)")
      .eq("id", topicId)
      .eq("forum_id", id)
      .single();

    if (topicError || !topic) return NextResponse.json({ ok: false, error: "الموضوع غير موجود" }, { status: 404 });

    // زيادة عدد المشاهدات
    await sb
      .from("ian_forum_topics")
      .update({ view_count: topic.view_count + 1 })
      .eq("id", topicId);

    // جلب الردود
    const { data: posts, error: postsError } = await sb
      .from("ian_forum_posts")
      .select("*, user:ian_users(email)")
      .eq("topic_id", topicId)
      .is("parent_id", null)
      .order("created_at", { ascending: true });

    if (postsError) return NextResponse.json({ ok: false, error: postsError.message }, { status: 500 });

    // جلب الردود الفرعية لكل رد
    const postsWithReplies = await Promise.all((posts || []).map(async (post) => {
      const { data: replies } = await sb
        .from("ian_forum_posts")
        .select("*, user:ian_users(email)")
        .eq("parent_id", post.id)
        .order("created_at", { ascending: true });
      return { ...post, replies: replies || [] };
    }));

    // جلب تصويت المستخدم الحالي
    const userId = await getUserId(user.email);
    let userVotes: Record<string, string> = {};
    if (userId) {
      const { data: topicVotes } = await sb
        .from("ian_forum_votes")
        .select("topic_id, vote_type")
        .eq("user_id", userId)
        .eq("topic_id", topicId);
      const { data: postVotes } = await sb
        .from("ian_forum_votes")
        .select("post_id, vote_type")
        .eq("user_id", userId)
        .in("post_id", postsWithReplies.map(p => p.id).flatMap(p => [p.id, ...(p.replies?.map((r: { id: string }) => r.id) || [])]));

      (topicVotes || []).forEach(v => { userVotes[`topic-${v.topic_id}`] = v.vote_type; });
      (postVotes || []).forEach(v => { userVotes[`post-${v.post_id}`] = v.vote_type; });
    }

    return NextResponse.json({ 
      ok: true, 
      topic: { ...topic, posts: postsWithReplies },
      userVote: userVotes,
    });
  }

  // قائمة المواضيع
  const offset = (page - 1) * limit;
  const { data: topics, error, count } = await sb
    .from("ian_forum_topics")
    .select("*, user:ian_users(email), last_reply_user:ian_users!ian_forum_topics_last_reply_by_fkey(email)", { count: "exact" })
    .eq("forum_id", id)
    .order("is_pinned", { ascending: false })
    .order("last_reply_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

  return NextResponse.json({ 
    ok: true, 
    topics: topics || [],
    pagination: {
      page,
      limit,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit),
    }
  });
}

// POST: إنشاء موضوع جديد
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ ok: false, error: "غير مصرح" }, { status: 401 });

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const { title, content } = body;

  if (!title || !content) return NextResponse.json({ ok: false, error: "عنوان ومحتوى مطلوبان" }, { status: 400 });

  const sb = getSupabase();
  if (!sb) return NextResponse.json({ ok: false, error: "DB غير متاح" }, { status: 503 });

  const userId = await getUserId(user.email);
  if (!userId) return NextResponse.json({ ok: false, error: "مستخدم غير موجود" }, { status: 404 });

  // التحقق من وجود المنتدى
  const { data: forum } = await sb.from("ian_forums").select("is_private, course_slug").eq("id", id).single();
  if (!forum) return NextResponse.json({ ok: false, error: "المنتدى غير موجود" }, { status: 404 });

  // التحقق من الخصوصية
  if (forum.is_private) {
    const { data: enrollment } = await sb
      .from("ian_enrollments")
      .select("id")
      .eq("course_slug", forum.course_slug)
      .eq("user_id", userId)
      .single();

    if (!enrollment && user.role !== "admin") {
      return NextResponse.json({ ok: false, error: "هذا المنتدى للطلاب المسجلين فقط" }, { status: 403 });
    }
  }

  const { data, error } = await sb
    .from("ian_forum_topics")
    .insert({
      forum_id: id,
      user_id: userId,
      title,
      content,
    })
    .select("*, user:ian_users(email)")
    .single();

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, topic: data });
}

// PUT: تحديث موضوع (صاحب الموضوع أو أدمن)
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ ok: false, error: "غير مصرح" }, { status: 401 });

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const { topicId, ...updates } = body;
  if (!topicId) return NextResponse.json({ ok: false, error: "معرف الموضوع مطلوب" }, { status: 400 });

  const sb = getSupabase();
  if (!sb) return NextResponse.json({ ok: false, error: "DB غير متاح" }, { status: 503 });

  const userId = await getUserId(user.email);
  if (!userId) return NextResponse.json({ ok: false, error: "مستخدم غير موجود" }, { status: 404 });

  // التحقق من الصلاحية
  const { data: topic } = await sb
    .from("ian_forum_topics")
    .select("user_id, forum_id")
    .eq("id", topicId)
    .eq("forum_id", id)
    .single();

  if (!topic) return NextResponse.json({ ok: false, error: "الموضوع غير موجود" }, { status: 404 });
  if (topic.user_id !== userId && user.role !== "admin") {
    return NextResponse.json({ ok: false, error: "غير مصرح" }, { status: 403 });
  }

  const { data, error } = await sb
    .from("ian_forum_topics")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", topicId)
    .select("*, user:ian_users(email)")
    .single();

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, topic: data });
}

// DELETE: حذف موضوع (صاحب الموضوع أو أدمن)
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ ok: false, error: "غير مصرح" }, { status: 401 });

  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const topicId = searchParams.get("topicId");
  if (!topicId) return NextResponse.json({ ok: false, error: "معرف الموضوع مطلوب" }, { status: 400 });

  const sb = getSupabase();
  if (!sb) return NextResponse.json({ ok: false, error: "DB غير متاح" }, { status: 503 });

  const userId = await getUserId(user.email);
  if (!userId) return NextResponse.json({ ok: false, error: "مستخدم غير موجود" }, { status: 404 });

  const { data: topic } = await sb
    .from("ian_forum_topics")
    .select("user_id")
    .eq("id", topicId)
    .eq("forum_id", id)
    .single();

  if (!topic) return NextResponse.json({ ok: false, error: "الموضوع غير موجود" }, { status: 404 });
  if (topic.user_id !== userId && user.role !== "admin") {
    return NextResponse.json({ ok: false, error: "غير مصرح" }, { status: 403 });
  }

  const { error } = await sb.from("ian_forum_topics").delete().eq("id", topicId);
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}