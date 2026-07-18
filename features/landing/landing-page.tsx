"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import { useScroll } from "framer-motion";
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

type LandingBootstrapResponse = {
  results: Array<{
    pollId: string;
    options: Array<{ optionId: string; votePercentage: number }>;
  }>;
  votes: Array<{ optionId: string; pollId: string }>;
};

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

  // One background request personalizes the already-rendered public poll UI.
  useEffect(() => {
    if (allPolls.length === 0) return undefined;

    const controller = new AbortController();
    const pollIds = allPolls.map((poll) => poll.id!);

    fetch("/api/landing/bootstrap", {
      cache: "no-store",
      credentials: "same-origin",
      signal: controller.signal,
    })
      .then((response) => {
        if (!response.ok) throw new Error("Unable to personalize landing polls.");
        return response.json() as Promise<LandingBootstrapResponse>;
      })
      .then(({ results, votes }) => {
        const nextVoteMap = new Map<string, string | null>(
          pollIds.map((id) => [id, null]),
        );
        for (const vote of votes) {
          if (nextVoteMap.has(vote.pollId)) {
            nextVoteMap.set(vote.pollId, vote.optionId);
          }
        }
        setVoteMap(nextVoteMap);

        const resultsByPoll = new Map(
          results.map((result) => [result.pollId, result.options]),
        );
        const nextWidthsMap = new Map<string, string[]>();
        for (const poll of allPolls) {
          const resultOptions = resultsByPoll.get(poll.id!);
          if (!resultOptions) continue;

          nextWidthsMap.set(
            poll.id!,
            poll.options.map((option) => {
              const result = resultOptions.find(
                (candidate) => candidate.optionId === option.id,
              );
              return result
                ? `${Math.max(4, Math.round(result.votePercentage))}%`
                : option.previewWidth;
            }),
          );
        }
        setWidthsMap(nextWidthsMap);
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setVoteMap(new Map(allPolls.map((poll) => [poll.id!, null])));
        }
      });

    return () => {
      controller.abort();
    };
  }, [allPolls]);

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
