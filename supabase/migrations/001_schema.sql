-- ============================================================
-- Adaptivly — Full Database Schema
-- Run this in Supabase SQL editor: Project → SQL Editor → New query
-- ============================================================

-- ─── Extensions ───────────────────────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ─── Users / Profiles ─────────────────────────────────────────────────────────
-- Extends Supabase auth.users with app-specific fields
create table if not exists public.profiles (
  id               uuid primary key references auth.users(id) on delete cascade,
  username         text unique,
  full_name        text,
  avatar_url       text,
  xp               integer not null default 0,
  coins            integer not null default 0,
  streak           integer not null default 0,
  longest_streak   integer not null default 0,
  last_active_date date,
  daily_goal       integer not null default 5,       -- problems per day goal
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- ─── Problems ─────────────────────────────────────────────────────────────────
create table if not exists public.problems (
  id            serial primary key,
  title         text not null,
  difficulty    text not null check (difficulty in ('Easy', 'Medium', 'Hard')),
  topic         text not null,
  tags          text[] not null default '{}',
  description   text not null,
  examples      jsonb not null default '[]',
  constraints   text[] not null default '{}',
  starter_code  jsonb not null default '{}',       -- { Python: "...", JavaScript: "...", ... }
  leetcode_url  text,
  neetcode_url  text,
  xp_reward     integer not null default 50,
  acceptance    numeric(5,2) not null default 0,
  created_at    timestamptz not null default now()
);

-- ─── Submissions ──────────────────────────────────────────────────────────────
create table if not exists public.submissions (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  problem_id  integer not null references public.problems(id) on delete cascade,
  language    text not null,
  code        text not null,
  status      text not null check (status in ('Accepted', 'Wrong Answer', 'TLE', 'MLE', 'Runtime Error', 'Compilation Error', 'Pending')),
  runtime_ms  integer,
  memory_kb   integer,
  created_at  timestamptz not null default now()
);

-- ─── User Problem Status ──────────────────────────────────────────────────────
-- Denormalised for fast lookup on problem list
create table if not exists public.user_problem_status (
  user_id    uuid not null references public.profiles(id) on delete cascade,
  problem_id integer not null references public.problems(id) on delete cascade,
  solved     boolean not null default false,
  starred    boolean not null default false,
  primary key (user_id, problem_id)
);

-- ─── Study Sessions (for heatmap + analytics) ─────────────────────────────────
create table if not exists public.study_sessions (
  id               uuid primary key default uuid_generate_v4(),
  user_id          uuid not null references public.profiles(id) on delete cascade,
  session_date     date not null,
  duration_minutes integer not null default 0,
  problems_solved  integer not null default 0
);
create unique index if not exists study_sessions_user_date on public.study_sessions(user_id, session_date);

-- ─── Flashcard Decks ──────────────────────────────────────────────────────────
create table if not exists public.flashcard_decks (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  name       text not null,
  subject    text not null default '',
  created_at timestamptz not null default now()
);

-- ─── Flashcards ───────────────────────────────────────────────────────────────
create table if not exists public.flashcards (
  id           uuid primary key default uuid_generate_v4(),
  deck_id      uuid not null references public.flashcard_decks(id) on delete cascade,
  question     text not null,
  answer       text not null,
  difficulty   text not null check (difficulty in ('Easy', 'Medium', 'Hard')),
  created_at   timestamptz not null default now()
);

-- ─── Flashcard Reviews (SM-2 spaced repetition) ───────────────────────────────
create table if not exists public.flashcard_reviews (
  id             uuid primary key default uuid_generate_v4(),
  card_id        uuid not null references public.flashcards(id) on delete cascade,
  user_id        uuid not null references public.profiles(id) on delete cascade,
  rating         text not null check (rating in ('easy', 'good', 'hard')),
  ease_factor    numeric(4,2) not null default 2.5,  -- SM-2 ease factor
  interval_days  integer not null default 1,
  next_review_at timestamptz not null default now(),
  reviewed_at    timestamptz not null default now(),
  unique (card_id, user_id)
);

-- ─── Notes ────────────────────────────────────────────────────────────────────
create table if not exists public.notes (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  title      text not null,
  content    text not null default '',
  folder     text not null default 'General',
  tags       text[] not null default '{}',
  pinned     boolean not null default false,
  starred    boolean not null default false,
  word_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ─── AI Chat Sessions ─────────────────────────────────────────────────────────
create table if not exists public.ai_chat_sessions (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  title      text not null default 'New chat',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ─── AI Chat Messages ─────────────────────────────────────────────────────────
create table if not exists public.ai_chat_messages (
  id         uuid primary key default uuid_generate_v4(),
  session_id uuid not null references public.ai_chat_sessions(id) on delete cascade,
  role       text not null check (role in ('user', 'assistant')),
  content    text not null,
  created_at timestamptz not null default now()
);

-- ─── Mock Interview Sessions ───────────────────────────────────────────────────
create table if not exists public.mock_sessions (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid not null references public.profiles(id) on delete cascade,
  type         text not null,
  score        integer,
  duration_min integer,
  status       text not null check (status in ('in_progress', 'completed')) default 'in_progress',
  strengths    text[] not null default '{}',
  weaknesses   text[] not null default '{}',
  suggestion   text,
  messages     jsonb not null default '[]',   -- full Q&A transcript
  created_at   timestamptz not null default now(),
  completed_at timestamptz
);

-- ─── Planner Tasks ────────────────────────────────────────────────────────────
create table if not exists public.planner_tasks (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid not null references public.profiles(id) on delete cascade,
  title        text not null,
  tag          text not null default '',
  priority     text not null check (priority in ('high', 'medium', 'low')) default 'medium',
  scheduled_at timestamptz not null,
  done         boolean not null default false,
  created_at   timestamptz not null default now()
);

-- ─── YouTube Summaries ────────────────────────────────────────────────────────
create table if not exists public.yt_summaries (
  id               uuid primary key default uuid_generate_v4(),
  user_id          uuid not null references public.profiles(id) on delete cascade,
  video_id         text not null,
  title            text not null default '',
  channel          text not null default '',
  duration         text not null default '',
  summary          text not null default '',
  detailed_summary text not null default '',
  key_points       text[] not null default '{}',
  concepts         text[] not null default '{}',
  tags             text[] not null default '{}',
  formulas         text[] not null default '{}',
  algorithms       text[] not null default '{}',
  revision_notes   text not null default '',
  flashcards       jsonb not null default '[]'::jsonb,
  quiz_questions   jsonb not null default '[]'::jsonb,
  raw_transcript   text not null default '',
  created_at       timestamptz not null default now()
);

-- ─── Achievements / Badges ────────────────────────────────────────────────────
create table if not exists public.user_achievements (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  badge_id   text not null,
  earned_at  timestamptz not null default now(),
  unique (user_id, badge_id)
);

-- ============================================================
-- Row Level Security — every table locked down to its owner
-- ============================================================

alter table public.profiles enable row level security;
alter table public.submissions enable row level security;
alter table public.user_problem_status enable row level security;
alter table public.study_sessions enable row level security;
alter table public.flashcard_decks enable row level security;
alter table public.flashcards enable row level security;
alter table public.flashcard_reviews enable row level security;
alter table public.notes enable row level security;
alter table public.ai_chat_sessions enable row level security;
alter table public.ai_chat_messages enable row level security;
alter table public.mock_sessions enable row level security;
alter table public.planner_tasks enable row level security;
alter table public.yt_summaries enable row level security;
alter table public.user_achievements enable row level security;

-- Problems are public read
alter table public.problems enable row level security;
create policy "problems_public_read" on public.problems for select using (true);

-- Profiles
create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);

-- Submissions
create policy "submissions_own"       on public.submissions      for all using (auth.uid() = user_id);
create policy "user_problem_status_own" on public.user_problem_status for all using (auth.uid() = user_id);
create policy "study_sessions_own"    on public.study_sessions   for all using (auth.uid() = user_id);
create policy "flashcard_decks_own"   on public.flashcard_decks  for all using (auth.uid() = user_id);
create policy "flashcard_reviews_own" on public.flashcard_reviews for all using (auth.uid() = user_id);
create policy "notes_own"             on public.notes            for all using (auth.uid() = user_id);
create policy "ai_chat_sessions_own"  on public.ai_chat_sessions for all using (auth.uid() = user_id);
create policy "mock_sessions_own"     on public.mock_sessions    for all using (auth.uid() = user_id);
create policy "planner_tasks_own"     on public.planner_tasks    for all using (auth.uid() = user_id);
create policy "yt_summaries_own"      on public.yt_summaries     for all using (auth.uid() = user_id);
create policy "user_achievements_own" on public.user_achievements for all using (auth.uid() = user_id);

-- Flashcards: readable if user owns the deck
create policy "flashcards_own" on public.flashcards for all
  using (exists (select 1 from public.flashcard_decks d where d.id = flashcards.deck_id and d.user_id = auth.uid()));

-- AI chat messages: readable if user owns the session
create policy "ai_chat_messages_own" on public.ai_chat_messages for all
  using (exists (select 1 from public.ai_chat_sessions s where s.id = ai_chat_messages.session_id and s.user_id = auth.uid()));

-- ============================================================
-- Helper: auto-create profile on user signup
-- ============================================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- Helper: auto-update updated_at timestamps
-- ============================================================
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_updated_at  on public.profiles;
drop trigger if exists notes_updated_at     on public.notes;
drop trigger if exists ai_chat_sessions_upd on public.ai_chat_sessions;

create trigger profiles_updated_at  before update on public.profiles  for each row execute procedure public.set_updated_at();
create trigger notes_updated_at     before update on public.notes     for each row execute procedure public.set_updated_at();
create trigger ai_chat_sessions_upd before update on public.ai_chat_sessions for each row execute procedure public.set_updated_at();
