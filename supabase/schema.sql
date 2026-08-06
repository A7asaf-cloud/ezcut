-- EZCut database schema. Paste this whole file into the Supabase SQL editor
-- (Project -> SQL Editor -> New query) and run it once.

-- 1. Daily logs table -------------------------------------------------------

create table if not exists public.daily_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  log_date date not null,
  weight_kg numeric(5, 2) not null,
  physique_photo_path text not null,
  menu_screenshot_path text not null,
  ai_feedback text,
  created_at timestamptz not null default now(),
  unique (user_id, log_date)
);

alter table public.daily_logs enable row level security;

create policy "Users can select their own logs"
  on public.daily_logs for select
  using (auth.uid() = user_id);

create policy "Users can insert their own logs"
  on public.daily_logs for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own logs"
  on public.daily_logs for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 2. Storage buckets ---------------------------------------------------------
-- Private buckets. Files are stored under `${auth.uid()}/${log_date}/...`
-- so the storage policies below can scope access to the owning user via the
-- first path segment.

insert into storage.buckets (id, name, public)
values ('physique-photos', 'physique-photos', false)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('meal-screenshots', 'meal-screenshots', false)
on conflict (id) do nothing;

create policy "Users can manage their own physique photos"
  on storage.objects for all
  using (
    bucket_id = 'physique-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  )
  with check (
    bucket_id = 'physique-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can manage their own meal screenshots"
  on storage.objects for all
  using (
    bucket_id = 'meal-screenshots'
    and auth.uid()::text = (storage.foldername(name))[1]
  )
  with check (
    bucket_id = 'meal-screenshots'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
