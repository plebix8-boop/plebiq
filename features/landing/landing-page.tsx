"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useScroll } from "framer-motion";
import { createClient } from "@/utils/supabase/client";
import { useAuth } from "@/contexts/auth-context";
import { FeedSection } from "./components/feed-section";
import { HeroSection } from "./components/hero-section";
import type { FeaturedPoll } from "./data";

type LandingPageProps = {
  featuredPoll: FeaturedPoll;
  feedPolls: FeaturedPoll[];
  feedCategories: string[];
};

// undefined = still loading | null = no vote | string = optionId the user voted for
export type VoteState = string | null | undefined;

export type VoteProps = {
  existingVoteOptionId: VoteState;
  freshOptionWidths: string[] | undefined;
};

// ── helpers ──────────────────────────────────────────────────────────────────

function computeFreshWidths(
  poll: FeaturedPoll,
  optionRows: { id: string; poll_id: string; vote_count: number | null }[],
): string[] | undefined {
  const rows = optionRows.filter((o) => o.poll_id === poll.id);
  const total = rows.reduce((sum, o) => sum + (o.vote_count ?? 0), 0);
  if (total === 0) return undefined;

  return poll.options.map((opt) => {
    const match = rows.find((o) => o.id === opt.id);
    return `${Math.max(4, Math.round(((match?.vote_count ?? 0) / total) * 100))}%`;
  });
}

// ── component ─────────────────────────────────────────────────────────────────

export function LandingPage({
  featuredPoll,
  feedPolls,
  feedCategories,
}: LandingPageProps) {
  const spacerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: spacerRef,
    offset: ["start start", "end start"],
  });

  const { userId, isAuthLoading } = useAuth();

  // Map<pollId, optionId | null> — null means no vote, undefined (missing key) means loading
  const [voteMap, setVoteMap] = useState<Map<string, string | null> | null>(null);
  // Map<pollId, string[]> — fresh width percentages from the DB
  const [widthsMap, setWidthsMap] = useState<Map<string, string[]>>(new Map());

  // All polls including the hero, deduplicated by id
  const allPolls = useMemo(() => {
    const seen = new Set<string>();
    return [featuredPoll, ...feedPolls].filter((p) => {
      if (!p.id) return false;
      if (seen.has(p.id)) return false;
      seen.add(p.id);
      return true;
    });
  }, [featuredPoll, feedPolls]);

  // Batch fetch: one vote query + one poll_options query for every poll on the page
  useEffect(() => {
    if (isAuthLoading) return;

    if (!userId || allPolls.length === 0) {
      // Not signed in — nothing to fetch, mark all polls as "no vote"
      setVoteMap(new Map(allPolls.map((p) => [p.id!, null])));
      return;
    }

    const pollIds = allPolls.map((p) => p.id!);
    const supabase = createClient();

    Promise.all([
      supabase
        .from("votes")
        .select("poll_id, option_id")
        .in("poll_id", pollIds)
        .eq("user_id", userId),

      supabase
        .from("poll_options")
        .select("id, poll_id, vote_count")
        .in("poll_id", pollIds),
    ]).then(([{ data: votes }, { data: options }]) => {
      // Build vote map — every pollId gets an entry (null = no vote)
      const newVoteMap = new Map<string, string | null>(
        pollIds.map((id) => [id, null]),
      );
      for (const v of votes ?? []) {
        newVoteMap.set(v.poll_id as string, v.option_id as string);
      }
      setVoteMap(newVoteMap);

      // Build fresh widths map
      if (options && options.length > 0) {
        const rows = options as { id: string; poll_id: string; vote_count: number | null }[];
        const newWidthsMap = new Map<string, string[]>();
        for (const poll of allPolls) {
          const widths = computeFreshWidths(poll, rows);
          if (widths) newWidthsMap.set(poll.id!, widths);
        }
        setWidthsMap(newWidthsMap);
      }
    });
  // allPolls is stable (memoized), isAuthLoading + userId are primitives
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthLoading, userId]);

  // Returns the voteProps for a given poll — called per PollPreview render
  function getVoteProps(pollId: string | undefined): VoteProps {
    if (!pollId || !voteMap) {
      // voteMap null = still resolving
      return { existingVoteOptionId: undefined, freshOptionWidths: undefined };
    }
    return {
      existingVoteOptionId: voteMap.has(pollId) ? voteMap.get(pollId)! : null,
      freshOptionWidths: widthsMap.get(pollId),
    };
  }

  return (
    <main className="relative bg-app-bg">
      <HeroSection
        scrollYProgress={scrollYProgress}
        featuredPoll={featuredPoll}
        voteProps={getVoteProps(featuredPoll.id)}
      />
      {/* Scroll spacer: 100vh of scroll room drives the hero exit animation */}
      <div aria-hidden="true" className="h-screen" ref={spacerRef} />
      <FeedSection
        polls={feedPolls}
        categories={feedCategories}
        getVoteProps={getVoteProps}
      />
    </main>
  );
}
