-- ============================================================
-- Rate My Username — leaderboard_entries table + RLS
-- Run this once in the Supabase SQL editor for your project
-- (in addition to supabase_saved_results.sql, which is separate
-- and untouched — this is a new, independent table).
-- ============================================================

create extension if not exists pgcrypto; -- provides gen_random_uuid()

-- One row per user. The existing Check/Rate action upserts this row on
-- every rate — there is no separate "submit to leaderboard" button and
-- no unbounded history: each user has exactly one public leaderboard
-- position, always reflecting their most recent rate result.
create table if not exists public.leaderboard_entries (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null unique references auth.users (id) on delete cascade,
  username     text not null,                 -- the @handle that was rated (public)
  score        integer not null check (score >= 0 and score <= 100),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- Ranking order: highest score first; ties broken by whoever reached that
-- score first (stable, doesn't reshuffle on every page load), then by id
-- as a final deterministic tiebreaker. The app sorts client-side using
-- this exact order, so the index just makes that sort cheap.
create index if not exists leaderboard_entries_rank_idx
  on public.leaderboard_entries (score desc, updated_at asc, id asc);

alter table public.leaderboard_entries enable row level security;

-- Only signed-in users may read the leaderboard at all (enforces "leaderboard
-- is for signed-in users only" at the database layer, not just in the UI).
-- No email, password, or other account data lives on this table, so a
-- broad "any authenticated user can read" policy exposes nothing sensitive.
create policy "read leaderboard as signed-in user"
  on public.leaderboard_entries
  for select
  to authenticated
  using (true);

create policy "insert own leaderboard entry"
  on public.leaderboard_entries
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "update own leaderboard entry"
  on public.leaderboard_entries
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- No delete policy — the app never removes a leaderboard entry; a user's
-- position is simply overwritten (upserted) on their next rate.

-- ============================================================
-- Content safety: block slurs/profanity at the database layer too.
-- The app's JS filter (script.js, hasBlockedContent) already stops
-- most bad input before it's sent, but that's client-side only —
-- anyone calling the Supabase API directly could bypass it. This
-- trigger re-checks on every insert/update so the public leaderboard
-- can't carry blocked terms even via a direct API call.
-- Keep this list in sync with BLOCKED_TERMS in script.js.
-- ============================================================
create or replace function public.leaderboard_username_guard()
returns trigger as $$
declare
  normalized text;
  blocked_terms text[] := array[
    'nigger','nigga','chink','spic','kike','faggot','fag','tranny',
    'retard','retarded','coon','gook','wetback','beaner','paki',
    'cripple','towelhead','cunt','whore','slut','rape','rapist',
    'pedo','pedophile','nazi','hitler','kys','killyourself','suicide'
  ];
  term text;
begin
  normalized := lower(new.username);
  normalized := replace(replace(normalized, '@', 'a'), '4', 'a');
  normalized := replace(normalized, '3', 'e');
  normalized := replace(replace(replace(normalized, '1', 'i'), '!', 'i'), '|', 'i');
  normalized := replace(normalized, '0', 'o');
  normalized := replace(replace(normalized, '5', 's'), '$', 's');
  normalized := replace(normalized, '7', 't');
  normalized := regexp_replace(normalized, '[^a-z]', '', 'g');

  foreach term in array blocked_terms loop
    if normalized like '%' || term || '%' then
      raise exception 'username contains blocked content';
    end if;
  end loop;

  return new;
end;
$$ language plpgsql;

drop trigger if exists leaderboard_username_guard_trigger on public.leaderboard_entries;
create trigger leaderboard_username_guard_trigger
  before insert or update on public.leaderboard_entries
  for each row execute function public.leaderboard_username_guard();
