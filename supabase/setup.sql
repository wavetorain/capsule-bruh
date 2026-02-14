-- Run this in Supabase SQL editor once.
create extension if not exists "pgcrypto";

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  text text not null check (length(trim(text)) > 0),
  created_at timestamptz not null default now()
);

create table if not exists public.voicemails (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.direct_messages (
  id uuid primary key default gen_random_uuid(),
  sender text not null check (sender in ('me', 'partner')),
  receiver text not null check (receiver in ('me', 'partner')),
  body text not null check (length(trim(body)) > 0),
  created_at timestamptz not null default now()
);

create table if not exists public.albums (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.album_images (
  id uuid primary key default gen_random_uuid(),
  album_id uuid not null references public.albums(id) on delete cascade,
  url text not null,
  created_at timestamptz not null default now()
);

create or replace function public.touch_albums_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_touch_albums_updated_at on public.albums;
create trigger trg_touch_albums_updated_at
before update on public.albums
for each row execute function public.touch_albums_updated_at();

alter table public.posts enable row level security;
alter table public.voicemails enable row level security;
alter table public.direct_messages enable row level security;
alter table public.albums enable row level security;
alter table public.album_images enable row level security;

drop policy if exists posts_all on public.posts;
create policy posts_all on public.posts for all using (true) with check (true);

drop policy if exists voicemails_all on public.voicemails;
create policy voicemails_all on public.voicemails for all using (true) with check (true);

drop policy if exists direct_messages_all on public.direct_messages;
create policy direct_messages_all on public.direct_messages for all using (true) with check (true);

drop policy if exists albums_all on public.albums;
create policy albums_all on public.albums for all using (true) with check (true);

drop policy if exists album_images_all on public.album_images;
create policy album_images_all on public.album_images for all using (true) with check (true);

insert into storage.buckets (id, name, public)
values ('voicemails', 'voicemails', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('gallery', 'gallery', true)
on conflict (id) do nothing;

drop policy if exists voicemails_public_read on storage.objects;
create policy voicemails_public_read
on storage.objects for select
using (bucket_id = 'voicemails');

drop policy if exists voicemails_public_write on storage.objects;
create policy voicemails_public_write
on storage.objects for insert
with check (bucket_id = 'voicemails');

drop policy if exists gallery_public_read on storage.objects;
create policy gallery_public_read
on storage.objects for select
using (bucket_id = 'gallery');

drop policy if exists gallery_public_write on storage.objects;
create policy gallery_public_write
on storage.objects for insert
with check (bucket_id = 'gallery');
