-- Adds the "coming_soon" poll status.
-- Coming-soon polls are visible on the landing page (image + options) but cannot
-- be voted on. cast_vote() already rejects every status except 'live', so no
-- other function needs to change.
--
-- Run once in Supabase SQL Editor. It is safe to re-run.
alter type public.poll_status add value if not exists 'coming_soon';
