-- supabase/tables-5.sql : التقييمات والآراء — نفذه بعد tables-4.sql في Supabase SQL Editor

-- تقييمات الكورسات
create table if not exists public.ian_reviews (
  id uuid primary key default gen_random_uuid(),
  course_slug text not null references public.ian_courses(slug) on delete cascade,
  user_id uuid not null references public.ian_users(id) on delete cascade,
  rating int not null check (rating >= 1 and rating <= 5),
  title text not null default '',
  content text not null default '',
  helpful_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  
  -- طالب واحد يراجع كورس واحد فقط
  unique(course_slug, user_id)
);

-- فهرس للاستعلامات السريعة
create index if not exists idx_ian_reviews_course on public.ian_reviews(course_slug);
create index if not exists idx_ian_reviews_user on public.ian_reviews(user_id);
create index if not exists idx_ian_reviews_rating on public.ian_reviews(rating);

-- تفعيل الحماية
alter table public.ian_reviews enable row level security;