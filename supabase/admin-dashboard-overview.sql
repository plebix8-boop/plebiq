drop function if exists public.get_admin_dashboard_overview();

create or replace function public.get_admin_dashboard_overview()
returns table (
  total_users bigint,
  users_added_last_7d bigint,
  users_added_previous_7d bigint,
  new_users_today bigint,
  new_users_yesterday bigint,
  active_polls bigint,
  closing_soon_polls bigint,
  total_votes bigint,
  votes_last_7d bigint,
  votes_previous_7d bigint
)
language sql
security definer
set search_path = public, auth
as $$
  with user_counts as (
    select
      count(*) filter (where deleted_at is null) as total_users,
      count(*) filter (
        where deleted_at is null
          and created_at >= now() - interval '7 days'
      ) as users_added_last_7d,
      count(*) filter (
        where deleted_at is null
          and created_at >= now() - interval '14 days'
          and created_at < now() - interval '7 days'
      ) as users_added_previous_7d,
      count(*) filter (
        where deleted_at is null
          and created_at >= date_trunc('day', now())
      ) as new_users_today,
      count(*) filter (
        where deleted_at is null
          and created_at >= date_trunc('day', now()) - interval '1 day'
          and created_at < date_trunc('day', now())
      ) as new_users_yesterday
    from auth.users
  ),
  poll_counts as (
    select
      count(*) filter (where status = 'live'::public.poll_status) as active_polls,
      count(*) filter (
        where status = 'live'::public.poll_status
          and expires_at is not null
          and expires_at >= now()
          and expires_at <= now() + interval '72 hours'
      ) as closing_soon_polls,
      count(*) as poll_count
    from public.polls
  ),
  vote_counts as (
    select
      count(*)::bigint as total_votes,
      count(*) filter (
        where created_at >= now() - interval '7 days'
      )::bigint as votes_last_7d,
      count(*) filter (
        where created_at >= now() - interval '14 days'
          and created_at < now() - interval '7 days'
      )::bigint as votes_previous_7d
    from public.votes
  )
  select
    uc.total_users,
    uc.users_added_last_7d,
    uc.users_added_previous_7d,
    uc.new_users_today,
    uc.new_users_yesterday,
    pc.active_polls,
    pc.closing_soon_polls,
    vc.total_votes,
    vc.votes_last_7d,
    vc.votes_previous_7d
  from user_counts uc
  cross join poll_counts pc
  cross join vote_counts vc;
$$;

grant execute on function public.get_admin_dashboard_overview() to authenticated;
