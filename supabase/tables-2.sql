-- supabase/tables-2.sql : باقي الجداول — نفذه بعد tables-1.sql في Supabase SQL Editor

-- العلماء
create table if not exists public.ian_scholars (
  slug text primary key,
  name text not null,
  title text not null default '',
  bio text not null default '',
  created_at timestamptz not null default now()
);

-- الأخبار
create table if not exists public.ian_news (
  slug text primary key,
  title text not null,
  date text not null default '',
  body text not null default '',
  created_at timestamptz not null default now()
);

-- الفتاوى
create table if not exists public.ian_fatwas (
  id text primary key,
  q text not null,
  a text not null default '',
  scholar text not null default '',
  created_at timestamptz not null default now()
);

-- الشهادات
create table if not exists public.ian_certificates (
  code text primary key,
  student text not null,
  course text not null default '',
  date text not null default '',
  grade text not null default '',
  created_at timestamptz not null default now()
);

-- طلبات التقديم
create table if not exists public.ian_admissions (
  id text primary key,
  name text not null,
  phone text not null default '',
  track text not null default 'academy',
  course text not null default '',
  date text not null default '',
  status text not null default 'new',
  created_at timestamptz not null default now()
);

-- الإعدادات (صف واحد key=settings)
create table if not exists public.ian_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

-- تفعيل الحماية على الكل (بدون سياسات عامة — SERVICE_ROLE فقط)
alter table public.ian_users enable row level security;
alter table public.ian_courses enable row level security;
alter table public.ian_lessons enable row level security;
alter table public.ian_books enable row level security;
alter table public.ian_scholars enable row level security;
alter table public.ian_news enable row level security;
alter table public.ian_fatwas enable row level security;
alter table public.ian_certificates enable row level security;
alter table public.ian_admissions enable row level security;
alter table public.ian_settings enable row level security;

-- باكت الملفات أنشئه يدويا: Storage -> New bucket -> ian-files -> Private
