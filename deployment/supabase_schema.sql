-- ═══════════════════════════════════════════════════════════════════
-- BracketGenius — Supabase Database Schema
-- Run this in your Supabase SQL editor (supabase.com → SQL Editor)
-- ═══════════════════════════════════════════════════════════════════

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ── Profiles (auto-created on first Google login) ─────────────────────────────
create table if not exists public.profiles (
  id            uuid references auth.users on delete cascade primary key,
  full_name     text,
  avatar_url    text,
  email         text unique,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now(),
  brackets_count int default 0,
  analyses_count int default 0
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url, email)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    new.email
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ── Brackets ─────────────────────────────────────────────────────────────────
create table if not exists public.brackets (
  id            uuid default uuid_generate_v4() primary key,
  user_id       uuid references public.profiles(id) on delete cascade not null,
  bracket_type  text not null check (bracket_type in ('mens', 'womens')),
  name          text not null default 'My Bracket',
  picks         jsonb not null default '{}',
  reasoning_mode text default 'ai' check (reasoning_mode in ('ai', 'custom', 'chat')),
  custom_weights jsonb default '{}',
  is_public     boolean default false,
  score         int default 0,    -- for scoring if tracking live results
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- Index for fast user bracket lookups
create index if not exists brackets_user_id_idx on public.brackets(user_id);
create index if not exists brackets_type_idx    on public.brackets(bracket_type);

-- Unique constraint: one bracket per user per type per name
create unique index if not exists brackets_user_type_name_idx 
  on public.brackets(user_id, bracket_type, name);


-- ── Agent Chat History ────────────────────────────────────────────────────────
create table if not exists public.agent_chats (
  id            uuid default uuid_generate_v4() primary key,
  user_id       uuid references public.profiles(id) on delete cascade not null,
  bracket_type  text not null check (bracket_type in ('mens', 'womens')),
  messages      jsonb not null default '[]',
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

create unique index if not exists agent_chats_user_type_idx 
  on public.agent_chats(user_id, bracket_type);


-- ── Analysis Cache (avoid re-running same matchup analysis) ───────────────────
create table if not exists public.analysis_cache (
  id            uuid default uuid_generate_v4() primary key,
  matchup_key   text unique not null,  -- e.g. "mens_duke_vs_unc_2025"
  result        jsonb not null,
  created_at    timestamptz default now(),
  expires_at    timestamptz default now() + interval '6 hours'
);

create index if not exists analysis_cache_key_idx on public.analysis_cache(matchup_key);
create index if not exists analysis_cache_expires_idx on public.analysis_cache(expires_at);


-- ── Row Level Security ────────────────────────────────────────────────────────
alter table public.profiles     enable row level security;
alter table public.brackets     enable row level security;
alter table public.agent_chats  enable row level security;
alter table public.analysis_cache enable row level security;

-- Profiles: users can only read/update their own
create policy "Users can view own profile"   on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- Brackets: users can CRUD their own; public brackets are readable by all
create policy "Users can view own brackets"   on public.brackets for select using (auth.uid() = user_id or is_public = true);
create policy "Users can create brackets"     on public.brackets for insert with check (auth.uid() = user_id);
create policy "Users can update own brackets" on public.brackets for update using (auth.uid() = user_id);
create policy "Users can delete own brackets" on public.brackets for delete using (auth.uid() = user_id);

-- Agent chats: private to each user
create policy "Users can view own chats"   on public.agent_chats for select using (auth.uid() = user_id);
create policy "Users can create own chats" on public.agent_chats for insert with check (auth.uid() = user_id);
create policy "Users can update own chats" on public.agent_chats for update using (auth.uid() = user_id);

-- Analysis cache: readable by all authenticated users
create policy "All users can read analysis cache"   on public.analysis_cache for select using (auth.role() = 'authenticated');
create policy "All users can insert analysis cache" on public.analysis_cache for insert with check (auth.role() = 'authenticated');


-- ── Helper Views ─────────────────────────────────────────────────────────────

-- User bracket summary view
create or replace view public.user_bracket_summary as
select 
  b.id,
  b.user_id,
  b.bracket_type,
  b.name,
  b.reasoning_mode,
  b.is_public,
  b.score,
  b.created_at,
  b.updated_at,
  p.full_name,
  p.avatar_url,
  jsonb_object_keys(b.picks) as pick_count
from public.brackets b
join public.profiles p on p.id = b.user_id;


-- ── Cleanup expired cache ────────────────────────────────────────────────────
-- Add this as a Supabase scheduled function (or run manually)
-- delete from public.analysis_cache where expires_at < now();
