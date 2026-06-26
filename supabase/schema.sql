-- Free Time Supabase schema
-- Run this in the Supabase SQL editor.

create extension if not exists pgcrypto;

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null unique,
  description text not null default '',
  difficulty_vibe text not null default 'Mixed',
  icon text not null default 'XI',
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.questions (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories(id) on delete restrict,
  title text not null,
  hint text not null default '',
  difficulty text not null default 'medium' check (difficulty in ('easy', 'medium', 'hard')),
  max_guesses integer not null default 5 check (max_guesses > 0),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.answers (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.questions(id) on delete cascade,
  label text not null,
  rank integer not null default 1,
  base_points integer not null default 100 check (base_points >= 0),
  rarity_score integer not null default 25 check (rarity_score >= 0),
  rarity_label text not null default 'Solid' check (rarity_label in ('Tap-in', 'Solid', 'Niche', 'Streets Won''t Forget', 'Proper Ball Knowledge')),
  created_at timestamptz not null default now(),
  unique (question_id, label)
);

create table if not exists public.aliases (
  id uuid primary key default gen_random_uuid(),
  answer_id uuid not null references public.answers(id) on delete cascade,
  alias text not null,
  created_at timestamptz not null default now(),
  unique (answer_id, alias)
);

create index if not exists questions_category_id_idx on public.questions(category_id);
create index if not exists questions_active_created_idx on public.questions(active, created_at desc);
create index if not exists answers_question_rank_idx on public.answers(question_id, rank);
create index if not exists aliases_answer_id_idx on public.aliases(answer_id);

alter table public.categories enable row level security;
alter table public.questions enable row level security;
alter table public.answers enable row level security;
alter table public.aliases enable row level security;

-- No auth yet: public read/write policies for the anon key.
-- Tighten these when authentication is added.
do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'categories' and policyname = 'Public categories read') then
    create policy "Public categories read" on public.categories for select using (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'questions' and policyname = 'Public questions read') then
    create policy "Public questions read" on public.questions for select using (active = true);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'answers' and policyname = 'Public answers read') then
    create policy "Public answers read" on public.answers for select using (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'aliases' and policyname = 'Public aliases read') then
    create policy "Public aliases read" on public.aliases for select using (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'categories' and policyname = 'Public categories insert') then
    create policy "Public categories insert" on public.categories for insert with check (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'categories' and policyname = 'Public categories update') then
    create policy "Public categories update" on public.categories for update using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'questions' and policyname = 'Public questions insert') then
    create policy "Public questions insert" on public.questions for insert with check (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'answers' and policyname = 'Public answers insert') then
    create policy "Public answers insert" on public.answers for insert with check (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'aliases' and policyname = 'Public aliases insert') then
    create policy "Public aliases insert" on public.aliases for insert with check (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'questions' and policyname = 'Public questions update') then
    create policy "Public questions update" on public.questions for update using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'questions' and policyname = 'Public questions delete') then
    create policy "Public questions delete" on public.questions for delete using (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'answers' and policyname = 'Public answers update') then
    create policy "Public answers update" on public.answers for update using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'answers' and policyname = 'Public answers delete') then
    create policy "Public answers delete" on public.answers for delete using (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'aliases' and policyname = 'Public aliases update') then
    create policy "Public aliases update" on public.aliases for update using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'aliases' and policyname = 'Public aliases delete') then
    create policy "Public aliases delete" on public.aliases for delete using (true);
  end if;
end $$;

insert into public.categories (slug, name, description, difficulty_vibe, icon, sort_order)
values
  ('barclaysmen', 'Barclaysmen', 'Cult heroes, limbs, Barclays-era chaos.', 'Medium', 'BPL', 10),
  ('england-pain', 'England Pain', 'Squads, shootouts and tournament trauma.', 'Hard', 'ENG', 20),
  ('transfer-chaos', 'Transfer Chaos', 'Fees, flops, deadline-day madness.', 'Medium', '££', 30),
  ('champions-league-heritage', 'Champions League Heritage', 'European nights, great teams and forgotten finalists.', 'Hard', 'UCL', 40),
  ('streets-wont-forget', 'Streets Won''t Forget', 'Cult careers and serious nostalgia pulls.', 'Medium', 'SWF', 50),
  ('proper-ball-knowledge', 'Proper Ball Knowledge', 'Deep cuts for people who watched too much football.', 'Hard', 'PBK', 60),
  ('deadline-day', 'Deadline Day', 'Panic buys, fax machines and late-window theatre.', 'Medium', 'DD', 70),
  ('world-cup-fever', 'World Cup Fever', 'Golden balls, nations and summer heartbreak.', 'Mixed', 'WC', 80),
  ('premier-league-royalty', 'Premier League Royalty', 'Titles, ever-presents and top-flight dynasties.', 'Medium', 'PL', 90),
  ('manager-merry-go-round', 'Manager Merry-Go-Round', 'Touchline legends, chaos and tactical eras.', 'Hard', 'MGR', 100)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  difficulty_vibe = excluded.difficulty_vibe,
  icon = excluded.icon,
  sort_order = excluded.sort_order;
