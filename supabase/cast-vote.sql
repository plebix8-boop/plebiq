drop function if exists public.cast_vote(uuid, uuid);

create or replace function public.cast_vote(
  p_poll_id  uuid,
  p_option_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id          uuid;
  v_existing_option  uuid;
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  -- Poll must be live
  if not exists (
    select 1 from public.polls where id = p_poll_id and status = 'live'
  ) then
    raise exception 'Poll is not accepting votes';
  end if;

  -- Option must belong to this poll
  if not exists (
    select 1 from public.poll_options where id = p_option_id and poll_id = p_poll_id
  ) then
    raise exception 'Option does not belong to this poll';
  end if;

  -- Capture any existing vote so we can adjust counts
  select option_id into v_existing_option
  from public.votes
  where poll_id = p_poll_id and user_id = v_user_id;

  -- Upsert the vote row
  insert into public.votes (poll_id, user_id, option_id, is_mock, created_at, updated_at)
  values (p_poll_id, v_user_id, p_option_id, false, now(), now())
  on conflict (poll_id, user_id)
  do update set option_id = excluded.option_id, updated_at = now();

  -- Update cached vote_count on poll_options
  if v_existing_option is null then
    -- First-time vote: increment chosen option
    update public.poll_options
    set vote_count = vote_count + 1
    where id = p_option_id;

  elsif v_existing_option <> p_option_id then
    -- Changed vote: decrement old, increment new
    update public.poll_options
    set vote_count = greatest(0, vote_count - 1)
    where id = v_existing_option;

    update public.poll_options
    set vote_count = vote_count + 1
    where id = p_option_id;
    -- else: same option re-selected — no count change needed
  end if;

  -- Return the fresh breakdown for the poll
  return (
    select jsonb_build_object(
      'votedOptionId', p_option_id,
      'options', jsonb_agg(
        jsonb_build_object(
          'optionId',       po.id,
          'voteCount',      po.vote_count,
          'votePercentage',
            case
              when totals.total = 0 then 0
              else round((po.vote_count::numeric * 100.0) / totals.total, 2)
            end
        )
        order by po.sort_order nulls last
      )
    )
    from public.poll_options po
    cross join (
      select coalesce(sum(vote_count), 0) as total
      from public.poll_options
      where poll_id = p_poll_id
    ) totals
    where po.poll_id = p_poll_id
  );
end;
$$;

-- Accessible to every authenticated user (RLS still enforces per-row auth inside the function)
grant execute on function public.cast_vote(uuid, uuid) to authenticated;
