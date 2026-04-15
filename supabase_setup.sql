-- Run this in: Supabase Dashboard → SQL Editor → New query

create table todos (
  id             uuid        primary key default gen_random_uuid(),
  text           text        not null default '',
  subject        text        not null default 'other',
  scheduled_time text,
  time_estimate  integer,
  priority       text        not null default 'medium',
  date           text,
  completed      boolean     not null default false,
  mom_helped     boolean     not null default false,
  ai_generated   boolean     not null default false,
  notes          text,
  day_type       text,
  created_at     timestamptz not null default now()
);

-- Allow public read/write (no login required — personal family app)
alter table todos enable row level security;

create policy "public_all" on todos
  for all
  using (true)
  with check (true);
