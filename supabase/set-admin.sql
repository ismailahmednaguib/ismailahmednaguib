-- supabase/set-admin.sql : تعيين الأدمن مباشرة من Supabase SQL Editor
-- انسخ الملف كله والصقه في Supabase -> SQL Editor -> عدّل الإيميل والباسورد -> Run
-- لا حاجة لأي تيرمينال أو node — يتنفذ هناك على طول.

-- 0) تجهيز الإضافة والجدول (آمن — يتنفذ أكثر من مرة عادي)
create extension if not exists pgcrypto;

create table if not exists public.ian_users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  hash text not null,
  role text not null default 'admin',
  created_at timestamptz not null default now()
);

create table if not exists public.ian_store (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.ian_users enable row level security;
alter table public.ian_store enable row level security;

-- 1) عدّل السطرين دول فقط ثم دوس Run
DO $$
DECLARE
  v_email text := 'you@mail.com';       -- <<< حط إيميلك هنا
  v_pass  text := 'NewPassword12345';   -- <<< حط باسوردك هنا (10 حروف على الأقل)
  v_hash  text;
BEGIN
  IF v_email NOT LIKE '%@%.%' THEN
    RAISE EXCEPTION 'الإيميل غلط — عدّل v_email فوق';
  END IF;
  IF length(v_pass) < 10 THEN
    RAISE EXCEPTION 'الباسورد قصير — لازم 10 حروف على الأقل';
  END IF;

  v_email := lower(trim(v_email));
  v_hash := crypt(v_pass, gen_salt('bf', 12));

  -- الجدول العدل (الأساسي — الموقع يقرأ منه أولا)
  INSERT INTO public.ian_users(email, hash, role)
  VALUES (v_email, v_hash, 'admin')
  ON CONFLICT (email) DO UPDATE SET hash = EXCLUDED.hash, role = 'admin';

  -- نسخة احتياطية في ian_store (توافق خلفي)
  INSERT INTO public.ian_store(key, value, updated_at)
  VALUES (
    'users',
    jsonb_build_array(
      jsonb_build_object('email', v_email, 'hash', v_hash, 'role', 'admin')
    ),
    now()
  )
  ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();
END $$;

-- 2) تحقق أن الأدمن اتحفظ (يظهر إيميلك)
SELECT email, role, created_at FROM public.ian_users;
