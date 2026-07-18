"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import { useScroll } from "framer-motion";
import { createClient } from "@/utils/supabase/client";
import { useAuth } from "@/contexts/auth-context";
import { FeedSection } from "./components/feed-section";
import { HeroSection } from "./components/hero-section";
import type { FeaturedPoll } from "./data";

const ShareResultsModal = dynamic(
  () =>
    import("./components/share-results-modal").then(
      (module) => module.ShareResultsModal,
    ),
  { ssr: false },
);

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
  const [shareSelection, setShareSelection] = useState<{
    percentages: string[];
    poll: FeaturedPoll;
  } | null>(null);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isHeroActive, setIsHeroActive] = useState(true);

  function openShareResults(poll: FeaturedPoll, percentages: string[]) {
    setShareSelection({ percentages, poll });
    setIsShareOpen(true);
  }

  useEffect(() => {
    const spacer = spacerRef.current;
    if (!spacer) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => setIsHeroActive(entry.isIntersecting),
      { threshold: 0.05 },
    );
    observer.observe(spacer);
    return () => observer.disconnect();
  }, []);

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
    let cancelled = false;

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
    ])
      .then(([{ data: votes }, { data: options }]) => {
      if (cancelled) return;

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
      })
      .catch(() => {
        if (!cancelled) {
          setVoteMap(new Map(allPolls.map((poll) => [poll.id!, null])));
        }
      });

    return () => {
      cancelled = true;
    };
    // allPolls is stable (memoized), isAuthLoading + userId are primitives
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthLoading, userId]);

  useEffect(() => {
    const pollId = new URLSearchParams(window.location.search).get("poll");
    if (!pollId) return;

    const frame = window.requestAnimationFrame(() => {
      const pollCards = Array.from(document.querySelectorAll<HTMLElement>("[data-poll-id]"));
      const target = pollCards.find((card) => card.dataset.pollId === pollId);

      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    });

    return () => window.cancelAnimationFrame(frame);
  }, [featuredPoll.id, feedPolls]);

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
        isActive={isHeroActive}
        onShareResults={openShareResults}
        voteProps={getVoteProps(featuredPoll.id)}
      />
      {/* Scroll spacer: 100vh of scroll room drives the hero exit animation */}
      <div aria-hidden="true" className="h-screen" ref={spacerRef} />
      <FeedSection
        polls={feedPolls}
        categories={feedCategories}
        getVoteProps={getVoteProps}
        onShareResults={openShareResults}
      />
      {shareSelection ? (
        <ShareResultsModal
          isOpen={isShareOpen}
          onClose={() => setIsShareOpen(false)}
          percentages={shareSelection.percentages}
          poll={shareSelection.poll}
        />
      ) : null}
    </main>
  );
}
