-- supabase/tables-8.sql : منتديات النقاش — نفذه بعد tables-7.sql في Supabase SQL Editor

-- المنتديات (لكل كورس/درس)
create table if not exists public.ian_forums (
  id uuid primary key default gen_random_uuid(),
  course_slug text not null references public.ian_courses(slug) on delete cascade,
  lesson_id text, -- اختياري: ربط بدرس محدد
  title text not null,
  description text not null default '',
  is_private boolean not null default false, -- للطلاب المسجلين فقط
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- المواضيع/الأسئلة
create table if not exists public.ian_forum_topics (
  id uuid primary key default gen_random_uuid(),
  forum_id uuid not null references public.ian_forums(id) on delete cascade,
  user_id uuid not null references public.ian_users(id) on delete cascade,
  title text not null,
  content text not null,
  is_pinned boolean not null default false,
  is_locked boolean not null default false,
  is_resolved boolean not null default false,
  view_count int not null default 0,
  reply_count int not null default 0,
  last_reply_at timestamptz,
  last_reply_by uuid references public.ian_users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- الردود/التعليقات
create table if not exists public.ian_forum_posts (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references public.ian_forum_topics(id) on delete cascade,
  user_id uuid not null references public.ian_users(id) on delete cascade,
  content text not null,
  parent_id uuid references public.ian_forum_posts(id), -- للردود المتسلسلة
  is_solution boolean not null default false, -- تم تحديده كحل
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- الإعجابات/التصويت
create table if not exists public.ian_forum_votes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.ian_users(id) on delete cascade,
  topic_id uuid references public.ian_forum_topics(id) on delete cascade,
  post_id uuid references public.ian_forum_posts(id) on delete cascade,
  vote_type text not null check (vote_type in ('up', 'down')),
  created_at timestamptz not null default now(),
  
  unique (user_id, topic_id),
  unique (user_id, post_id)
);

-- الفهرس للاستعلامات السريعة
create index if not exists idx_ian_forums_course on public.ian_forums(course_slug);
create index if not exists idx_ian_forums_lesson on public.ian_forums(lesson_id);
create index if not exists idx_ian_forum_topics_forum on public.ian_forum_topics(forum_id);
create index if not exists idx_ian_forum_topics_user on public.ian_forum_topics(user_id);
create index if not exists idx_ian_forum_topics_resolved on public.ian_forum_topics(is_resolved);
create index if not exists idx_ian_forum_posts_topic on public.ian_forum_posts(topic_id);
create index if not exists idx_ian_forum_posts_user on public.ian_forum_posts(user_id);
create index if not exists idx_ian_forum_votes_topic on public.ian_forum_votes(topic_id);
create index if not exists idx_ian_forum_votes_post on public.ian_forum_votes(post_id);

-- تفعيل الحماية
alter table public.ian_forums enable row level security;
alter table public.ian_forum_topics enable row level security;
alter table public.ian_forum_posts enable row level security;
alter table public.ian_forum_votes enable row level security;