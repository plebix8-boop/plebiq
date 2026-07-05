drop function if exists public.get_landing_poll_results();

create or replace function public.get_landing_poll_results()
returns table (
  poll_id uuid,
  title text,
  description text,
  status text,
  category_name text,
  category_slug text,
  is_featured boolean,
  is_pinned boolean,
  sort_order integer,
  image_url text,
  view_count integer,
  total_votes bigint,
  option_breakdown jsonb
)
language sql
security definer
set search_path = public
as $$
  with option_votes as (
    select
      po.poll_id,
      po.id as option_id,
      po.label,
      po.description,
      po.sort_order,
      count(v.id) as vote_count
    from public.poll_options po
    left join public.votes v
      on v.option_id = po.id
    group by po.poll_id, po.id, po.label, po.description, po.sort_order
  ),
  poll_vote_totals as (
    select
      ov.poll_id,
      coalesce(sum(ov.vote_count), 0) as total_votes
    from option_votes ov
    group by ov.poll_id
  ),
  option_breakdowns as (
    select
      ov.poll_id,
      jsonb_agg(
        jsonb_build_object(
          'optionId', ov.option_id,
          'label', ov.label,
          'description', ov.description,
          'sortOrder', ov.sort_order,
          'voteCount', ov.vote_count,
          'votePercentage',
            case
              when pvt.total_votes = 0 then 0
              else round((ov.vote_count::numeric * 100.0) / pvt.total_votes, 2)
            end
        )
        order by ov.sort_order nulls last, ov.label
      ) as option_breakdown
    from option_votes ov
    join poll_vote_totals pvt
      on pvt.poll_id = ov.poll_id
    group by ov.poll_id, pvt.total_votes
  )
  select
    p.id as poll_id,
    p.title,
    p.description,
    p.status::text as status,
    c.name as category_name,
    c.slug as category_slug,
    p.is_featured,
    p.is_pinned,
    p.sort_order,
    p.image_url,
    p.view_count,
    coalesce(pvt.total_votes, 0) as total_votes,
    ob.option_breakdown
  from public.polls p
  left join public.categories c
    on c.id = p.category_id
  left join poll_vote_totals pvt
    on pvt.poll_id = p.id
  left join option_breakdowns ob
    on ob.poll_id = p.id
  where p.status = 'live'
  order by
    p.is_pinned desc,
    p.is_featured desc,
    p.sort_order asc nulls last,
    p.created_at desc;
$$;

grant execute on function public.get_landing_poll_results() to anon, authenticated;
