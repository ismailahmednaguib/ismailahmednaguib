-- supabase/tables-3.sql : الإشعارات — نفذه بعد tables-2.sql في Supabase SQL Editor

-- الإشعارات
create table if not exists public.ian_notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.ian_users(id) on delete cascade,
  type text not null default 'info', -- info, success, warning, error, new_lesson, new_certificate, enrollment, announcement
  title text not null,
  message text not null default '',
  link text, -- رابط اختياري للانتقال إليه عند الضغط
  read boolean not null default false,
  created_at timestamptz not null default now()
);

-- فهرس للاستعلامات السريعة
create index if not exists idx_ian_notifications_user_read on public.ian_notifications(user_id, read);
create index if not exists idx_ian_notifications_created on public.ian_notifications(created_at desc);

-- تفعيل الحماية
alter table public.ian_notifications enable row level security;