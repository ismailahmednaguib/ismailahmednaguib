-- supabase/tables-4.sql : الاختبارات والامتحانات — نفذه بعد tables-3.sql في Supabase SQL Editor

-- الاختبارات
create table if not exists public.ian_quizzes (
  id uuid primary key default gen_random_uuid(),
  course_slug text not null references public.ian_courses(slug) on delete cascade,
  lesson_id text, -- اختياري: ربط بدرس محدد
  title text not null,
  description text not null default '',
  time_limit int, -- بالدقائق، null = لا يوجد حد زمني
  passing_score int not null default 60, -- نسبة النجاح %
  max_attempts int not null default 3, -- عدد المحاولات المسموحة
  shuffle_questions boolean not null default true,
  shuffle_options boolean not null default true,
  show_correct_answers boolean not null default true,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- أسئلة الاختبار
create table if not exists public.ian_quiz_questions (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.ian_quizzes(id) on delete cascade,
  question_text text not null,
  question_type text not null default 'multiple_choice', -- multiple_choice, true_false, multiple_answer
  explanation text not null default '', -- شرح الإجابة الصحيحة
  points int not null default 1,
  order_index int not null default 0,
  created_at timestamptz not null default now()
);

-- خيارات الأسئلة
create table if not exists public.ian_quiz_options (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.ian_quiz_questions(id) on delete cascade,
  option_text text not null,
  is_correct boolean not null default false,
  order_index int not null default 0
);

-- محاولات الاختبار
create table if not exists public.ian_quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.ian_quizzes(id) on delete cascade,
  user_id uuid not null references public.ian_users(id) on delete cascade,
  score int not null default 0, -- النقاط المحققة
  max_score int not null default 0, -- إجمالي النقاط
  percentage int not null default 0, -- النسبة المئوية
  passed boolean not null default false,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  answers jsonb not null default '{}', -- إجابات المستخدم {question_id: option_id[]}
  time_spent int -- بالثواني
);

-- فهرس للاستعلامات السريعة
create index if not exists idx_ian_quizzes_course on public.ian_quizzes(course_slug);
create index if not exists idx_ian_quiz_questions_quiz on public.ian_quiz_questions(quiz_id);
create index if not exists idx_ian_quiz_options_question on public.ian_quiz_options(question_id);
create index if not exists idx_ian_quiz_attempts_user on public.ian_quiz_attempts(user_id, quiz_id);
create index if not exists idx_ian_quiz_attempts_completed on public.ian_quiz_attempts(completed_at desc);

-- تفعيل الحماية
alter table public.ian_quizzes enable row level security;
alter table public.ian_quiz_questions enable row level security;
alter table public.ian_quiz_options enable row level security;
alter table public.ian_quiz_attempts enable row level security;