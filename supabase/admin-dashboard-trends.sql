drop function if exists public.get_admin_dashboard_trends();

create or replace function public.get_admin_dashboard_trends()
returns table (
  votes_over_time jsonb,
  user_growth jsonb
)
language sql
security definer
set search_path = public, auth
as $$
  with
  vote_today as (
    select jsonb_agg(
      jsonb_build_object(
        'date', to_char(bucket_start, 'FMHH12am'),
        'value', vote_count
      )
      order by bucket_start
    ) as data
    from (
      select
        bucket_start,
        coalesce(count(v.id), 0)::int as vote_count
      from generate_series(
        date_trunc('day', now()),
        date_trunc('day', now()) + interval '21 hours',
        interval '3 hours'
      ) as bucket_start
      left join public.votes v
        on v.created_at >= bucket_start
       and v.created_at < bucket_start + interval '3 hours'
      group by bucket_start
    ) series
  ),
  vote_7d as (
    select jsonb_agg(
      jsonb_build_object(
        'date', to_char(day_start, 'Mon FMDD'),
        'value', vote_count
      )
      order by day_start
    ) as data
    from (
      select
        day_start,
        coalesce(count(v.id), 0)::int as vote_count
      from generate_series(
        date_trunc('day', now()) - interval '6 days',
        date_trunc('day', now()),
        interval '1 day'
      ) as day_start
      left join public.votes v
        on v.created_at >= day_start
       and v.created_at < day_start + interval '1 day'
      group by day_start
    ) series
  ),
  vote_30d as (
    select jsonb_agg(
      jsonb_build_object(
        'date', to_char(day_start, 'Mon FMDD'),
        'value', vote_count
      )
      order by day_start
    ) as data
    from (
      select
        day_start,
        coalesce(count(v.id), 0)::int as vote_count
      from generate_series(
        date_trunc('day', now()) - interval '29 days',
        date_trunc('day', now()),
        interval '1 day'
      ) as day_start
      left join public.votes v
        on v.created_at >= day_start
       and v.created_at < day_start + interval '1 day'
      group by day_start
    ) series
  ),
  vote_month as (
    select jsonb_agg(
      jsonb_build_object(
        'date', to_char(day_start, 'Mon FMDD'),
        'value', vote_count
      )
      order by day_start
    ) as data
    from (
      select
        day_start,
        coalesce(count(v.id), 0)::int as vote_count
      from generate_series(
        date_trunc('month', now()),
        date_trunc('day', now()),
        interval '1 day'
      ) as day_start
      left join public.votes v
        on v.created_at >= day_start
       and v.created_at < day_start + interval '1 day'
      group by day_start
    ) series
  ),
  user_7d as (
    select jsonb_agg(
      jsonb_build_object(
        'date', to_char(day_start, 'Mon FMDD'),
        'value', user_count
      )
      order by day_start
    ) as data
    from (
      select
        day_start,
        coalesce(count(u.id), 0)::int as user_count
      from generate_series(
        date_trunc('day', now()) - interval '6 days',
        date_trunc('day', now()),
        interval '1 day'
      ) as day_start
      left join auth.users u
        on u.deleted_at is null
       and u.created_at >= day_start
       and u.created_at < day_start + interval '1 day'
      group by day_start
    ) series
  ),
  user_30d as (
    select jsonb_agg(
      jsonb_build_object(
        'date', to_char(day_start, 'Mon FMDD'),
        'value', user_count
      )
      order by day_start
    ) as data
    from (
      select
        day_start,
        coalesce(count(u.id), 0)::int as user_count
      from generate_series(
        date_trunc('day', now()) - interval '29 days',
        date_trunc('day', now()),
        interval '1 day'
      ) as day_start
      left join auth.users u
        on u.deleted_at is null
       and u.created_at >= day_start
       and u.created_at < day_start + interval '1 day'
      group by day_start
    ) series
  ),
  user_month as (
    select jsonb_agg(
      jsonb_build_object(
        'date', to_char(day_start, 'Mon FMDD'),
        'value', user_count
      )
      order by day_start
    ) as data
    from (
      select
        day_start,
        coalesce(count(u.id), 0)::int as user_count
      from generate_series(
        date_trunc('month', now()),
        date_trunc('day', now()),
        interval '1 day'
      ) as day_start
      left join auth.users u
        on u.deleted_at is null
       and u.created_at >= day_start
       and u.created_at < day_start + interval '1 day'
      group by day_start
    ) series
  ),
  user_year as (
    select jsonb_agg(
      jsonb_build_object(
        'date', to_char(month_start, 'Mon'),
        'value', user_count
      )
      order by month_start
    ) as data
    from (
      select
        month_start,
        coalesce(count(u.id), 0)::int as user_count
      from generate_series(
        date_trunc('year', now()),
        date_trunc('month', now()),
        interval '1 month'
      ) as month_start
      left join auth.users u
        on u.deleted_at is null
       and u.created_at >= month_start
       and u.created_at < month_start + interval '1 month'
      group by month_start
    ) series
  )
  select
    jsonb_build_object(
      'today', coalesce((select data from vote_today), '[]'::jsonb),
      '7d', coalesce((select data from vote_7d), '[]'::jsonb),
      '30d', coalesce((select data from vote_30d), '[]'::jsonb),
      'month', coalesce((select data from vote_month), '[]'::jsonb)
    ) as votes_over_time,
    jsonb_build_object(
      '7d', coalesce((select data from user_7d), '[]'::jsonb),
      '30d', coalesce((select data from user_30d), '[]'::jsonb),
      'month', coalesce((select data from user_month), '[]'::jsonb),
      'year', coalesce((select data from user_year), '[]'::jsonb)
    ) as user_growth;
$$;

grant execute on function public.get_admin_dashboard_trends() to authenticated;
