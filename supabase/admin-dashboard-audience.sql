drop function if exists public.get_admin_dashboard_audience();

create or replace function public.get_admin_dashboard_audience()
returns table (
  users_by_country jsonb,
  votes_by_country jsonb,
  login_providers jsonb
)
language sql
security definer
set search_path = public, auth
as $$
  with user_base as (
    select
      u.id,
      coalesce(nullif(trim(u.raw_user_meta_data ->> 'country'), ''), 'Unknown') as country,
      coalesce(nullif(trim(u.raw_app_meta_data ->> 'provider'), ''), 'email') as provider
    from auth.users u
    where u.deleted_at is null
  ),
  users_by_country_data as (
    select jsonb_agg(
      jsonb_build_object(
        'country', country,
        'value', user_count
      )
      order by user_count desc, country asc
    ) as data
    from (
      select
        ub.country,
        count(*)::int as user_count
      from user_base ub
      group by ub.country
      order by user_count desc, ub.country asc
      limit 6
    ) ranked
  ),
  votes_by_country_data as (
    select jsonb_agg(
      jsonb_build_object(
        'country', country,
        'value', vote_count
      )
      order by vote_count desc, country asc
    ) as data
    from (
      select
        ub.country,
        count(v.id)::int as vote_count
      from public.votes v
      join user_base ub
        on ub.id = v.user_id
      group by ub.country
      order by vote_count desc, ub.country asc
      limit 6
    ) ranked
  ),
  provider_data as (
    select jsonb_agg(
      jsonb_build_object(
        'name', provider_name,
        'value', provider_share,
        'fill', provider_fill
      )
      order by provider_count desc, provider_name asc
    ) as data
    from (
      select
        case
          when lower(provider) = 'google' then 'Google'
          when lower(provider) = 'facebook' then 'Facebook'
          when lower(provider) = 'github' then 'GitHub'
          when lower(provider) = 'email' then 'Email'
          else initcap(provider)
        end as provider_name,
        count(*)::int as provider_count,
        round((count(*)::numeric * 100.0) / nullif(sum(count(*)) over (), 0), 0)::int as provider_share,
        case
          when lower(provider) = 'google' then 'var(--provider-google)'
          when lower(provider) = 'facebook' then 'var(--provider-facebook)'
          when lower(provider) = 'github' then 'var(--subtle)'
          when lower(provider) = 'email' then 'var(--chart-secondary)'
          else 'var(--chart-primary)'
        end as provider_fill
      from user_base
      group by provider
      order by provider_count desc, provider_name asc
      limit 5
    ) ranked
  )
  select
    coalesce((select data from users_by_country_data), '[]'::jsonb) as users_by_country,
    coalesce((select data from votes_by_country_data), '[]'::jsonb) as votes_by_country,
    coalesce((select data from provider_data), '[]'::jsonb) as login_providers;
$$;

grant execute on function public.get_admin_dashboard_audience() to authenticated;
