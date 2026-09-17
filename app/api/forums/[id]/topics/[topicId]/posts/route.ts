// app/api/forums/[id]/topics/[topicId]/posts/route.ts : إدارة ردود الموضوع
import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { currentUser } from "@/lib/auth";

async function getUserId(email: string): Promise<string | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data } = await sb.from("ian_users").select("id").eq("email", email).single();
  return data?.id || null;
}

// POST: إضافة رد جديد
export async function POST(req: Request, { params }: { params: Promise<{ id: string; topicId: string }> }) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ ok: false, error: "غير مصرح" }, { status: 401 });

  const { id, topicId } = await params;
  const body = await req.json().catch(() => ({}));
  const { content, parent_id } = body;

  if (!content) return NextResponse.json({ ok: false, error: "المحتوى مطلوب" }, { status: 400 });

  const sb = getSupabase();
  if (!sb) return NextResponse.json({ ok: false, error: "DB غير متاح" }, { status: 503 });

  const userId = await getUserId(user.email);
  if (!userId) return NextResponse.json({ ok: false, error: "مستخدم غير موجود" }, { status: 404 });

  // التحقق من وجود الموضوع
  const { data: topic, error: topicError } = await sb
    .from("ian_forum_topics")
    .select("id, forum_id, is_locked, reply_count, user_id, title")
    .eq("id", topicId)
    .eq("forum_id", id)
    .single();

  if (topicError || !topic) return NextResponse.json({ ok: false, error: "الموضوع غير موجود" }, { status: 404 });
  if (topic.is_locked && user.role !== "admin") {
    return NextResponse.json({ ok: false, error: "الموضوع مغلق للردود" }, { status: 403 });
  }

  // إذا كان رداً على رد، التحقق من وجود الرد الأصلي
  if (parent_id) {
    const { data: parentPost } = await sb
      .from("ian_forum_posts")
      .select("id")
      .eq("id", parent_id)
      .eq("topic_id", topicId)
      .single();

    if (!parentPost) return NextResponse.json({ ok: false, error: "الرد الأصلي غير موجود" }, { status: 404 });
  }

  const { data, error } = await sb
    .from("ian_forum_posts")
    .insert({
      topic_id: topicId,
      user_id: userId,
      content,
      parent_id: parent_id || null,
    })
    .select("*, user:ian_users(email)")
    .single();

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

  // تحديث الموضوع: زيادة عدد الردود، تحديث آخر رد
  await sb
    .from("ian_forum_topics")
    .update({
      reply_count: topic.reply_count + 1,
      last_reply_at: new Date().toISOString(),
      last_reply_by: userId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", topicId);

  // إرسال إشعار لصاحب الموضوع
  if (topic.user_id !== userId) {
    try {
      const { createNotification } = await import("@/lib/notifications");
      await createNotification({
        userId: topic.user_id,
        type: "info",
        title: "رد جديد على موضوعك",
        message: `قام ${user.email} بالرد على موضوع "${topic.title}"`,
        link: `/forums/${id}/topics/${topicId}`,
      });
    } catch {
      // تجاهل خطأ الإشعار
    }
  }

  return NextResponse.json({ ok: true, post: data });
}

// PUT: تحديث رد (صاحب الرد أو أدمن)
export async function PUT(req: Request, { params }: { params: Promise<{ id: string; topicId: string }> }) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ ok: false, error: "غير مصرح" }, { status: 401 });

  const { topicId } = await params;
  const body = await req.json().catch(() => ({}));
  const { postId, content } = body;
  if (!postId || !content) return NextResponse.json({ ok: false, error: "معرف الرد والمحتوى مطلوبان" }, { status: 400 });

  const sb = getSupabase();
  if (!sb) return NextResponse.json({ ok: false, error: "DB غير متاح" }, { status: 503 });

  const userId = await getUserId(user.email);
  if (!userId) return NextResponse.json({ ok: false, error: "مستخدم غير موجود" }, { status: 404 });

  const { data: post } = await sb
    .from("ian_forum_posts")
    .select("user_id")
    .eq("id", postId)
    .eq("topic_id", topicId)
    .single();

  if (!post) return NextResponse.json({ ok: false, error: "الرد غير موجود" }, { status: 404 });
  if (post.user_id !== userId && user.role !== "admin") {
    return NextResponse.json({ ok: false, error: "غير مصرح" }, { status: 403 });
  }

  const { data, error } = await sb
    .from("ian_forum_posts")
    .update({ content, updated_at: new Date().toISOString() })
    .eq("id", postId)
    .select("*, user:ian_users(email)")
    .single();

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, post: data });
}

// DELETE: حذف رد (صاحب الرد أو أدمن)
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string; topicId: string }> }) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ ok: false, error: "غير مصرح" }, { status: 401 });

  const { topicId } = await params;
  const { searchParams } = new URL(req.url);
  const postId = searchParams.get("postId");
  if (!postId) return NextResponse.json({ ok: false, error: "معرف الرد مطلوب" }, { status: 400 });

  const sb = getSupabase();
  if (!sb) return NextResponse.json({ ok: false, error: "DB غير متاح" }, { status: 503 });

  const userId = await getUserId(user.email);
  if (!userId) return NextResponse.json({ ok: false, error: "مستخدم غير موجود" }, { status: 404 });

  const { data: post } = await sb
    .from("ian_forum_posts")
    .select("user_id, topic_id")
    .eq("id", postId)
    .single();

  if (!post) return NextResponse.json({ ok: false, error: "الرد غير موجود" }, { status: 404 });
  if (post.user_id !== userId && user.role !== "admin") {
    return NextResponse.json({ ok: false, error: "غير مصرح" }, { status: 403 });
  }

  const { error } = await sb.from("ian_forum_posts").delete().eq("id", postId);
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

  // تحديث عدد الردود في الموضوع
  try {
    await sb.rpc("decrement_topic_replies", { topic_id: topicId });
  } catch {
    // fallback إذا لم تكن الدالة موجودة
    await sb
      .from("ian_forum_topics")
      .update({ 
        reply_count: sb.from("ian_forum_posts").select("id", { count: "exact", head: true }).eq("topic_id", topicId) 
      })
      .eq("id", topicId);
  }

  return NextResponse.json({ ok: true });
}