-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard)
-- Project: bqbuxejwmpzzynvoqath

create table if not exists scores (
  id uuid primary key default gen_random_uuid(),
  player_name text not null,
  total_score integer not null,
  rooms_cleared integer not null default 0,
  max_multiplier real not null default 1.0,
  created_at timestamptz not null default now()
);

-- Index for fast leaderboard queries
create index if not exists scores_total_score_idx on scores (total_score desc);

-- Enable Row Level Security (allow anonymous reads and inserts)
alter table scores enable row level security;

create policy "Anyone can read scores"
  on scores for select using (true);

create policy "Anyone can insert scores"
  on scores for insert with check (true);
