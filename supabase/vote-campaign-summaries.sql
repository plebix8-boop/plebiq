drop function if exists public.get_vote_campaign_summaries();

create or replace function public.get_vote_campaign_summaries()
returns table (
  campaign_id text,
  poll_id uuid,
  poll_title text,
  total_votes bigint,
  created_at_start timestamptz,
  created_at_end timestamptz,
  option_breakdown jsonb
)
language sql
security definer
set search_path = public
as $$
  with campaign_totals as (
    select
      v.mock_campaign_id as campaign_id,
      v.poll_id,
      count(*) as total_votes,
      min(v.created_at) as created_at_start,
      max(v.created_at) as created_at_end
    from public.votes v
    where v.mock_campaign_id is not null
      and v.is_mock = true
      and v.seed_source = 'admin-vote-campaign'
    group by v.mock_campaign_id, v.poll_id
  ),
  option_counts as (
    select
      v.mock_campaign_id as campaign_id,
      v.poll_id,
      po.id as option_id,
      po.label,
      count(*) as option_count
    from public.votes v
    join public.poll_options po
      on po.id = v.option_id
    where v.mock_campaign_id is not null
      and v.is_mock = true
      and v.seed_source = 'admin-vote-campaign'
    group by v.mock_campaign_id, v.poll_id, po.id, po.label
  ),
  option_breakdowns as (
    select
      oc.campaign_id,
      oc.poll_id,
      jsonb_agg(
        jsonb_build_object(
          'optionId', oc.option_id,
          'label', oc.label,
          'count', oc.option_count
        )
        order by oc.label
      ) as option_breakdown
    from option_counts oc
    group by oc.campaign_id, oc.poll_id
  )
  select
    ct.campaign_id,
    ct.poll_id,
    p.title as poll_title,
    ct.total_votes,
    ct.created_at_start,
    ct.created_at_end,
    ob.option_breakdown
  from campaign_totals ct
  join public.polls p
    on p.id = ct.poll_id
  join option_breakdowns ob
    on ob.campaign_id = ct.campaign_id
   and ob.poll_id = ct.poll_id
  order by ct.created_at_end desc nulls last, ct.campaign_id desc;
$$;

grant execute on function public.get_vote_campaign_summaries() to authenticated;
