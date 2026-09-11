-- supabase/tables.sql : جداول عدلة — نفذه مرة واحدة في Supabase SQL Editor
-- بعدها تتحكم في كل حاجة من Supabase -> Table Editor مباشرة (تعديل/إضافة/حذف).
-- الأمان: RLS مفعل ولا توجد سياسات للعامة — القراءة والكتابة عبر SERVICE_ROLE فقط.

create extension if not exists pgcrypto;

-- المستخدمون (الأدمن)
create table if not exists public.ian_users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  hash text not null,
  role text not null default 'admin',
  created_at timestamptz not null default now()
);

-- الدورات
create table if not exists public.ian_courses (
  slug text primary key,
  title text not null,
  track text not null default 'academy',
  level text not null default '',
  teacher text not null default '',
  hours int not null default 0,
  price int not null default 0,
  description text not null default '',
  video_url text not null default '',
  created_at timestamptz not null default now()
);

-- الدروس
create table if not exists public.ian_lessons (
  id text primary key,
  course_slug text not null default '',
  title text not null,
  video_url text not null default '',
  duration text not null default '',
  is_free boolean not null default true,
  created_at timestamptz not null default now()
);

-- الكتب
create table if not exists public.ian_books (
  slug text primary key,
  title text not null,
  author text not null default '',
  track text not null default 'academy',
  pages int not null default 0,
  pdf_url text not null default '',
  description text not null default '',
  created_at timestamptz not null default now()
);
