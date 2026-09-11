-- supabase/schema.sql : نفذه مرة واحدة في Supabase SQL Editor
-- ينشئ جدول التخزين الموحد + يفعل RLS (مقفول تماما على العامة،
-- ومفتوح فقط لمفتاح SERVICE_ROLE الموجود في سيرفر Vercel فقط).

create table if not exists public.ian_store (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.ian_store enable row level security;

-- لا توجد أي سياسة للعامة: القراءة والكتابة عبر SERVICE_ROLE فقط (يتجاوز RLS).
-- لا تنشئ سياسات public هنا.

-- باكت الملفات ينشأ تلقائيا من كود الرفع، أو أنشئه يدويا من:
-- Storage -> New bucket -> اسم: ian-files -> Private
