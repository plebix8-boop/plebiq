create table if not exists public.admin_role_changes (
  id uuid primary key default gen_random_uuid(),
  target_user_id uuid not null,
  target_user_email text,
  previous_role text not null check (previous_role in ('user', 'admin')),
  new_role text not null check (new_role in ('user', 'admin')),
  acting_admin_id uuid not null,
  created_at timestamptz not null default now()
);

alter table public.admin_role_changes enable row level security;

drop policy if exists "Admins can read role changes" on public.admin_role_changes;
create policy "Admins can read role changes"
on public.admin_role_changes
for select
to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create index if not exists admin_role_changes_target_user_idx
  on public.admin_role_changes (target_user_id, created_at desc);

create index if not exists admin_role_changes_created_at_idx
  on public.admin_role_changes (created_at desc);
