create extension if not exists "pgcrypto";

do $$
begin
  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'poll_status'
      and n.nspname = 'public'
  ) then
    create type public.poll_status as enum ('draft', 'live', 'closed');
  end if;
end $$;

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.polls (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  category_id uuid references public.categories(id) on delete set null,
  status public.poll_status not null default 'draft',
  is_featured boolean not null default false,
  is_pinned boolean not null default false,
  sort_order integer,
  image_url text,
  expires_at timestamptz,
  closed_at timestamptz,
  view_count integer not null default 0,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.poll_options (
  id uuid primary key default gen_random_uuid(),
  poll_id uuid not null references public.polls(id) on delete cascade,
  label text not null,
  description text not null,
  sort_order integer,
  vote_count integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.votes (
  id uuid primary key default gen_random_uuid(),
  poll_id uuid not null references public.polls(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  option_id uuid not null references public.poll_options(id) on delete cascade,
  is_mock boolean not null default false,
  mock_campaign_id text,
  seed_source text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (poll_id, user_id)
);

create index if not exists polls_category_id_idx on public.polls(category_id);
create index if not exists polls_status_idx on public.polls(status);
create index if not exists polls_featured_idx on public.polls(is_featured);
create index if not exists polls_pinned_idx on public.polls(is_pinned);
create index if not exists poll_options_poll_id_idx on public.poll_options(poll_id);
create index if not exists votes_poll_id_idx on public.votes(poll_id);
create index if not exists votes_user_id_idx on public.votes(user_id);
create index if not exists votes_option_id_idx on public.votes(option_id);
create index if not exists votes_is_mock_idx on public.votes(is_mock);
create index if not exists votes_mock_campaign_id_idx on public.votes(mock_campaign_id);
create index if not exists votes_seed_source_idx on public.votes(seed_source);

drop function if exists public.set_updated_at();
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_polls_updated_at on public.polls;
create trigger set_polls_updated_at
before update on public.polls
for each row
execute function public.set_updated_at();

drop trigger if exists set_votes_updated_at on public.votes;
create trigger set_votes_updated_at
before update on public.votes
for each row
execute function public.set_updated_at();

alter table public.categories enable row level security;
alter table public.polls enable row level security;
alter table public.poll_options enable row level security;
alter table public.votes enable row level security;

drop policy if exists "authenticated users can read categories" on public.categories;
create policy "authenticated users can read categories"
on public.categories
for select
to authenticated
using (true);

drop policy if exists "admins can manage categories" on public.categories;
create policy "admins can manage categories"
on public.categories
for all
to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "authenticated users can read polls" on public.polls;
create policy "authenticated users can read polls"
on public.polls
for select
to authenticated
using (true);

drop policy if exists "admins can manage polls" on public.polls;
create policy "admins can manage polls"
on public.polls
for all
to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "authenticated users can read poll options" on public.poll_options;
create policy "authenticated users can read poll options"
on public.poll_options
for select
to authenticated
using (true);

drop policy if exists "admins can manage poll options" on public.poll_options;
create policy "admins can manage poll options"
on public.poll_options
for all
to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "authenticated users can read votes" on public.votes;
create policy "authenticated users can read votes"
on public.votes
for select
to authenticated
using (true);

drop policy if exists "authenticated users can vote once per poll" on public.votes;
create policy "authenticated users can vote once per poll"
on public.votes
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "users can update their own votes" on public.votes;
create policy "users can update their own votes"
on public.votes
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "admins can manage votes" on public.votes;
create policy "admins can manage votes"
on public.votes
for all
to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
