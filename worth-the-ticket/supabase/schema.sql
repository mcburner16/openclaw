-- Worth the Ticket? — Database Schema
-- Run this in your Supabase SQL editor to set up the database.

-- Reviews table
create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  title text not null,
  year integer,
  genre text,
  watch_type text check (watch_type in ('theater', 'streaming')),
  platform text,
  rating numeric(2,1) check (rating >= 0 and rating <= 5),
  verdict text check (verdict in ('Worth the Ticket', 'Stream It', 'Skip It', 'Wait for Sale')),
  what_worked text,
  what_didnt_work text,
  theater_notes text,
  spoiler_free boolean default true,
  raw_thoughts text,
  posted boolean default false,
  watch_date date default current_date
);

-- Generated content table
create table if not exists generated_content (
  id uuid primary key default gen_random_uuid(),
  review_id uuid references reviews(id) on delete cascade,
  created_at timestamptz default now(),
  tiktok_slides jsonb,
  tiktok_caption text,
  instagram_caption text,
  facebook_post text,
  twitter_post text,
  podcast_seed text
);

-- Analytics table
create table if not exists analytics (
  id uuid primary key default gen_random_uuid(),
  review_id uuid references reviews(id) on delete cascade,
  created_at timestamptz default now(),
  views integer default 0,
  likes integer default 0,
  comments integer default 0,
  shares integer default 0,
  saves integer default 0,
  followers_gained integer default 0,
  avg_watch_time numeric(5,2),
  retention_notes text
);

-- Content calendar table
create table if not exists content_calendar (
  id uuid primary key default gen_random_uuid(),
  review_id uuid references reviews(id) on delete set null,
  scheduled_date date not null,
  status text check (status in ('planned', 'posted', 'draft')) default 'planned',
  notes text,
  created_at timestamptz default now()
);

-- Post ideas table
create table if not exists post_ideas (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  category text,
  idea text not null,
  used boolean default false
);
