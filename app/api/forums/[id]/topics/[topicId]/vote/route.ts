// app/api/forums/[id]/topics/[topicId]/vote/route.ts : التصويت على المواضيع والردود
import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { currentUser } from "@/lib/auth";

async function getUserId(email: string): Promise<string | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data } = await sb.from("ian_users").select("id").eq("email", email).single();
  return data?.id || null;
}

// POST: التصويت
export async function POST(req: Request, { params }: { params: Promise<{ id: string; topicId: string }> }) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ ok: false, error: "غير مصرح" }, { status: 401 });

  const { topicId } = await params;
  const body = await req.json().catch(() => ({}));
  const { voteType, postId } = body; // voteType: "up" | "down"

  if (!voteType || !["up", "down"].includes(voteType)) {
    return NextResponse.json({ ok: false, error: "نوع تصويت غير صحيح" }, { status: 400 });
  }

  const sb = getSupabase();
  if (!sb) return NextResponse.json({ ok: false, error: "DB غير متاح" }, { status: 503 });

  const userId = await getUserId(user.email);
  if (!userId) return NextResponse.json({ ok: false, error: "مستخدم غير موجود" }, { status: 404 });

  if (postId) {
    // تصويت على رد
    const { data: post } = await sb
      .from("ian_forum_posts")
      .select("id, topic_id")
      .eq("id", postId)
      .single();

    if (!post || post.topic_id !== topicId) {
      return NextResponse.json({ ok: false, error: "الرد غير موجود" }, { status: 404 });
    }

    // upsert التصويت
    const { data, error } = await sb
      .from("ian_forum_votes")
      .upsert({
        user_id: userId,
        post_id: postId,
        vote_type: voteType,
      }, { onConflict: "user_id,post_id" })
      .select()
      .single();

    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

    return NextResponse.json({ ok: true, vote: data });
  } else {
    // تصويت على موضوع
    const { data: topic } = await sb
      .from("ian_forum_topics")
      .select("id, forum_id")
      .eq("id", topicId)
      .single();

    if (!topic) return NextResponse.json({ ok: false, error: "الموضوع غير موجود" }, { status: 404 });

    const { data, error } = await sb
      .from("ian_forum_votes")
      .upsert({
        user_id: userId,
        topic_id: topicId,
        vote_type: voteType,
      }, { onConflict: "user_id,topic_id" })
      .select()
      .single();

    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

    return NextResponse.json({ ok: true, vote: data });
  }
}

// DELETE: إلغاء التصويت
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string; topicId: string }> }) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ ok: false, error: "غير مصرح" }, { status: 401 });

  const { topicId } = await params;
  const { searchParams } = new URL(req.url);
  const postId = searchParams.get("postId");

  const sb = getSupabase();
  if (!sb) return NextResponse.json({ ok: false, error: "DB غير متاح" }, { status: 503 });

  const userId = await getUserId(user.email);
  if (!userId) return NextResponse.json({ ok: false, error: "مستخدم غير موجود" }, { status: 404 });

  if (postId) {
    const { error } = await sb
      .from("ian_forum_votes")
      .delete()
      .eq("user_id", userId)
      .eq("post_id", postId);

    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  } else {
    const { error } = await sb
      .from("ian_forum_votes")
      .delete()
      .eq("user_id", userId)
      .eq("topic_id", topicId);

    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

// GET: جلب التصويتات
export async function GET(req: Request, { params }: { params: Promise<{ id: string; topicId: string }> }) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ ok: false, error: "غير مصرح" }, { status: 401 });

  const { topicId } = await params;
  const sb = getSupabase();
  if (!sb) return NextResponse.json({ ok: false, error: "DB غير متاح" }, { status: 503 });

  const userId = await getUserId(user.email);
  if (!userId) return NextResponse.json({ ok: false, error: "مستخدم غير موجود" }, { status: 404 });

  // تصويت المستخدم على الموضوع
  const { data: topicVote } = await sb
    .from("ian_forum_votes")
    .select("vote_type")
    .eq("user_id", userId)
    .eq("topic_id", topicId)
    .single();

  // تصويتات المستخدم على الردود
  const { data: postVotes } = await sb
    .from("ian_forum_votes")
    .select("post_id, vote_type")
    .eq("user_id", userId)
    .not("post_id", "is", null);

  return NextResponse.json({ 
    ok: true, 
    topicVote: topicVote?.vote_type || null,
    postVotes: Object.fromEntries((postVotes || []).map(v => [v.post_id, v.vote_type])),
  });
}