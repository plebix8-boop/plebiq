drop function if exists public.get_admin_dashboard_polls();

create or replace function public.get_admin_dashboard_polls()
returns table (
  poll_id uuid,
  poll_title text,
  category_name text,
  poll_status text,
  total_votes bigint,
  last_vote_at timestamptz,
  health text
)
language sql
security definer
set search_path = public
as $$
  with vote_counts as (
    select
      v.poll_id,
      count(*)::bigint as total_votes,
      max(v.created_at) as last_vote_at
    from public.votes v
    group by v.poll_id
  ),
  option_vote_counts as (
    select
      po.poll_id,
      po.id as option_id,
      count(v.id)::bigint as option_votes
    from public.poll_options po
    left join public.votes v
      on v.option_id = po.id
    group by po.poll_id, po.id
  ),
  option_stats as (
    select
      ovc.poll_id,
      max(ovc.option_votes) as top_option_votes,
      count(*)::bigint as option_count
    from option_vote_counts ovc
    group by ovc.poll_id
  ),
  poll_metrics as (
    select
      p.id as poll_id,
      p.title as poll_title,
      coalesce(c.name, 'Uncategorized') as category_name,
      p.status::text as poll_status,
      coalesce(vc.total_votes, 0)::bigint as total_votes,
      vc.last_vote_at,
      coalesce(os.top_option_votes, 0)::bigint as top_option_votes,
      coalesce(os.option_count, 0)::bigint as option_count
    from public.polls p
    left join public.categories c
      on c.id = p.category_id
    left join vote_counts vc
      on vc.poll_id = p.id
    left join option_stats os
      on os.poll_id = p.id
    where p.status = 'live'::public.poll_status
  )
  select
    pm.poll_id,
    pm.poll_title,
    pm.category_name,
    initcap(pm.poll_status) as poll_status,
    pm.total_votes,
    pm.last_vote_at,
    case
      when pm.total_votes < 20 then 'Low Engagement'
      when pm.total_votes between 20 and 49 then 'Needs Promotion'
      when pm.last_vote_at is null or pm.last_vote_at <= now() - interval '24 hours' then 'Voting Slowed Down'
      when pm.total_votes between 50 and 89 then 'Low Conversion'
      when pm.total_votes >= 20
        and pm.option_count >= 2
        and ((pm.top_option_votes::numeric * 100.0) / nullif(pm.total_votes, 0)) >= 80
        then 'One-sided'
      when pm.total_votes >= 20
        and pm.option_count >= 2
        and ((pm.top_option_votes::numeric * 100.0) / nullif(pm.total_votes, 0)) <= 55
        then 'Very Competitive'
      else 'High Engagement'
    end as health
  from poll_metrics pm
  order by pm.total_votes desc, pm.poll_title asc;
$$;

grant execute on function public.get_admin_dashboard_polls() to authenticated;
