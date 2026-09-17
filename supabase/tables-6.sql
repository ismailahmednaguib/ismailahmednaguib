-- supabase/tables-6.sql : الدروس المباشرة — نفذه بعد tables-5.sql في Supabase SQL Editor

-- الجلسات المباشرة
create table if not exists public.ian_live_sessions (
  id uuid primary key default gen_random_uuid(),
  course_slug text not null references public.ian_courses(slug) on delete cascade,
  lesson_id text, -- ربط بدرس محدد (اختياري)
  title text not null,
  description text not null default '',
  provider text not null default 'jitsi', -- jitsi, zoom, custom
  meeting_url text, -- رابط الاجتماع (للزووم أو مخصص)
  meeting_id text, -- معرف الاجتماع (للجيتسي)
  meeting_password text, -- كلمة مرور الاجتماع
  scheduled_at timestamptz not null,
  duration int not null default 60, -- بالدقائق
  max_participants int not null default 100,
  status text not null default 'scheduled', -- scheduled, live, ended, cancelled
  host_email text not null, -- إيميل المضيف (المعلم)
  recording_url text, -- رابط التسجيل (بعد الانتهاء)
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- مشاركون في الجلسات المباشرة
create table if not exists public.ian_live_participants (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.ian_live_sessions(id) on delete cascade,
  user_id uuid not null references public.ian_users(id) on delete cascade,
  joined_at timestamptz,
  left_at timestamptz,
  duration int, -- بالثواني
  role text not null default 'participant', -- participant, host, co_host
  
  unique(session_id, user_id)
);

-- فهرس للاستعلامات السريعة
create index if not exists idx_ian_live_sessions_course on public.ian_live_sessions(course_slug);
create index if not exists idx_ian_live_sessions_scheduled on public.ian_live_sessions(scheduled_at);
create index if not exists idx_ian_live_sessions_status on public.ian_live_sessions(status);
create index if not exists idx_ian_live_participants_session on public.ian_live_participants(session_id);
create index if not exists idx_ian_live_participants_user on public.ian_live_participants(user_id);

-- تفعيل الحماية
alter table public.ian_live_sessions enable row level security;
alter table public.ian_live_participants enable row level security;