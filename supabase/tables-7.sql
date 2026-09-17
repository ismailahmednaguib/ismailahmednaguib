-- supabase/tables-7.sql : المدفوعات — نفذه بعد tables-6.sql في Supabase SQL Editor

-- الطلبات/المدفوعات
create table if not exists public.ian_payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.ian_users(id) on delete cascade,
  course_slug text not null references public.ian_courses(slug) on delete cascade,
  amount int not null, -- بالهللات/السنتات
  currency text not null default 'SAR',
  provider text not null default 'stripe', -- stripe, paypal, manual
  provider_payment_id text, -- معرف الدفع من المزود
  provider_session_id text, -- معرف الجلسة (لـ Stripe Checkout)
  status text not null default 'pending', -- pending, completed, failed, refunded, cancelled
  metadata jsonb not null default '{}', -- بيانات إضافية
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- الاشتراكات (للدورات بنظام الاشتراك)
create table if not exists public.ian_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.ian_users(id) on delete cascade,
  plan_id text not null, -- معرف الخطة
  plan_name text not null,
  amount int not null,
  currency text not null default 'SAR',
  interval text not null default 'month', -- month, year
  provider text not null default 'stripe',
  provider_subscription_id text,
  status text not null default 'active', -- active, past_due, cancelled, trialing
  current_period_start timestamptz not null,
  current_period_end timestamptz not null,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- الفواتير
create table if not exists public.ian_invoices (
  id uuid primary key default gen_random_uuid(),
  payment_id uuid references public.ian_payments(id) on delete set null,
  subscription_id uuid references public.ian_subscriptions(id) on delete set null,
  user_id uuid not null references public.ian_users(id) on delete cascade,
  number text not null unique,
  amount int not null,
  currency text not null default 'SAR',
  status text not null default 'draft', -- draft, sent, paid, void
  pdf_url text,
  issued_at timestamptz not null default now(),
  due_at timestamptz,
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

-- فهرس للاستعلامات السريعة
create index if not exists idx_ian_payments_user on public.ian_payments(user_id);
create index if not exists idx_ian_payments_course on public.ian_payments(course_slug);
create index if not exists idx_ian_payments_status on public.ian_payments(status);
create index if not exists idx_ian_payments_provider on public.ian_payments(provider_payment_id);
create index if not exists idx_ian_subscriptions_user on public.ian_subscriptions(user_id);
create index if not exists idx_ian_invoices_user on public.ian_invoices(user_id);

-- تفعيل الحماية
alter table public.ian_payments enable row level security;
alter table public.ian_subscriptions enable row level security;
alter table public.ian_invoices enable row level security;