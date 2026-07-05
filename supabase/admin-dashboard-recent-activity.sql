drop function if exists public.get_admin_dashboard_recent_activity();

create or replace function public.get_admin_dashboard_recent_activity()
returns table (
  id text,
  icon text,
  text text,
  sub text,
  event_at timestamptz
)
language sql
security definer
set search_path = public, auth
as $$
  with user_events as (
    select
      'join-' || u.id::text as id,
      'join'::text as icon,
      trim(
        both ' '
        from coalesce(nullif(u.raw_user_meta_data ->> 'first_name', ''), split_part(coalesce(u.raw_user_meta_data ->> 'full_name', 'Someone'), ' ', 1))
        || ' '
        || coalesce(nullif(u.raw_user_meta_data ->> 'last_name', ''), nullif(regexp_replace(coalesce(u.raw_user_meta_data ->> 'full_name', ''), '^\S+\s*', ''), ''))
      ) || ' joined from '
      || coalesce(nullif(trim(u.raw_user_meta_data ->> 'country'), ''), 'Unknown') as text,
      'via '
      || case
        when lower(coalesce(u.raw_app_meta_data ->> 'provider', 'email')) = 'google' then 'Google'
        when lower(coalesce(u.raw_app_meta_data ->> 'provider', 'email')) = 'facebook' then 'Facebook'
        when lower(coalesce(u.raw_app_meta_data ->> 'provider', 'email')) = 'github' then 'GitHub'
        else 'Email'
      end as sub,
      u.created_at as event_at
    from auth.users u
    where u.deleted_at is null
  ),
  vote_events as (
    select
      'vote-' || v.id::text as id,
      'vote'::text as icon,
      trim(
        both ' '
        from coalesce(nullif(u.raw_user_meta_data ->> 'first_name', ''), split_part(coalesce(u.raw_user_meta_data ->> 'full_name', 'Someone'), ' ', 1))
        || ' '
        || coalesce(nullif(u.raw_user_meta_data ->> 'last_name', ''), nullif(regexp_replace(coalesce(u.raw_user_meta_data ->> 'full_name', ''), '^\S+\s*', ''), ''))
      ) || ' voted on "' || p.title || '"' as text,
      'via '
      || case
        when lower(coalesce(u.raw_app_meta_data ->> 'provider', 'email')) = 'google' then 'Google'
        when lower(coalesce(u.raw_app_meta_data ->> 'provider', 'email')) = 'facebook' then 'Facebook'
        when lower(coalesce(u.raw_app_meta_data ->> 'provider', 'email')) = 'github' then 'GitHub'
        else 'Email'
      end as sub,
      v.created_at as event_at
    from public.votes v
    join auth.users u
      on u.id = v.user_id
    join public.polls p
      on p.id = v.poll_id
    where u.deleted_at is null
  ),
  poll_status_events as (
    select
      'status-' || p.id::text as id,
      'status'::text as icon,
      case
        when p.status = 'closed'::public.poll_status then 'Poll "' || p.title || '" closed'
        when p.status = 'live'::public.poll_status then 'Poll "' || p.title || '" set to Live'
        else 'Poll "' || p.title || '" updated'
      end as text,
      'by Admin'::text as sub,
      coalesce(p.closed_at, p.updated_at, p.created_at) as event_at
    from public.polls p
  ),
  merged as (
    select * from user_events
    union all
    select * from vote_events
    union all
    select * from poll_status_events
  )
  select
    id,
    icon,
    text,
    sub,
    event_at
  from merged
  order by event_at desc nulls last
  limit 12;
$$;

grant execute on function public.get_admin_dashboard_recent_activity() to authenticated;
