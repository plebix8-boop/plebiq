drop function if exists public.get_admin_poll_country_traffic(uuid);

create or replace function public.get_admin_poll_country_traffic(p_poll_id uuid)
returns table (country text, value integer)
language sql
security definer
set search_path = public, auth
as $$
  select
    coalesce(nullif(trim(u.raw_user_meta_data ->> 'country'), ''), 'Unknown') as country,
    count(v.id)::integer as value
  from public.votes v
  join auth.users u on u.id = v.user_id
  where v.poll_id = p_poll_id
    and u.deleted_at is null
  group by 1
  order by value desc, country asc;
$$;

grant execute on function public.get_admin_poll_country_traffic(uuid) to authenticated;
