do $$
begin
  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'feedback_category'
      and n.nspname = 'public'
  ) then
    create type public.feedback_category as enum (
      'suggestion',
      'bug_report',
      'feature_request',
      'general'
    );
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'feedback_status'
      and n.nspname = 'public'
  ) then
    create type public.feedback_status as enum (
      'new',
      'under_review',
      'in_discussion',
      'planned',
      'in_progress',
      'implemented',
      'declined',
      'duplicate'
    );
  end if;
end $$;

create table if not exists public.feedback (
  id uuid not null default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  user_email text not null,
  category public.feedback_category not null,
  message text not null,
  status public.feedback_status not null default 'new',
  internal_notes text,
  resolved_at timestamptz,
  resolved_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint feedback_pkey primary key (id),
  constraint feedback_message_min_length check (char_length(trim(message)) >= 10)
);

create index if not exists feedback_user_id_idx on public.feedback(user_id);
create index if not exists feedback_user_email_idx on public.feedback(user_email);
create index if not exists feedback_category_idx on public.feedback(category);
create index if not exists feedback_status_idx on public.feedback(status);
create index if not exists feedback_created_at_idx on public.feedback(created_at desc);
create index if not exists feedback_resolved_at_idx on public.feedback(resolved_at);

drop trigger if exists set_feedback_updated_at on public.feedback;
create trigger set_feedback_updated_at
before update on public.feedback
for each row
execute function public.set_updated_at();

alter table public.feedback enable row level security;

drop policy if exists "users can create own feedback" on public.feedback;
create policy "users can create own feedback"
on public.feedback
for insert
to authenticated
with check (
  auth.uid() = user_id
  and user_email = auth.jwt() ->> 'email'
);

drop policy if exists "users can read own feedback" on public.feedback;
create policy "users can read own feedback"
on public.feedback
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "admins can read all feedback" on public.feedback;
create policy "admins can read all feedback"
on public.feedback
for select
to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "admins can update feedback" on public.feedback;
create policy "admins can update feedback"
on public.feedback
for update
to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
