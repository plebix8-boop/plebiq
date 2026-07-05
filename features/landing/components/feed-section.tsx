import { useState } from "react";
import type { FeaturedPoll } from "../data";
import type { VoteProps } from "../landing-page";
import { PollPreview } from "./poll-preview";

type FeedSectionProps = {
  polls: FeaturedPoll[];
  categories: string[];
  getVoteProps: (pollId: string | undefined) => VoteProps;
};

export function FeedSection({ polls, categories, getVoteProps }: FeedSectionProps) {
  const [activeCategory, setActiveCategory] = useState("All");

  const visiblePolls =
    activeCategory === "All"
      ? polls
      : polls.filter((poll) => poll.category === activeCategory);

  return (
    <section
      className="relative z-20 min-h-screen bg-app-bg px-5 py-12 pb-16 text-white sm:px-8 lg:py-16 lg:pb-24"
      id="feed"
    >
      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-8 flex flex-col gap-5 sm:mb-10 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-fuchsia-200/70">
              Feed
            </p>
            <h2 className="mt-3 text-4xl font-black leading-tight sm:text-5xl">
              Active polls
            </h2>
            <p className="mt-3 max-w-2xl text-base leading-7 text-white/55">
              Explore live questions moving across product, culture, tech, and
              world conversations.
            </p>
          </div>

          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {categories.map((category) => (
              <button
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
                  activeCategory === category
                    ? "bg-filter-active-bg text-filter-active-text"
                    : "bg-filter-idle-bg text-filter-idle-text hover:bg-filter-idle-bg-hover hover:text-filter-idle-text-hover"
                }`}
                key={category}
                onClick={() => setActiveCategory(category)}
                type="button"
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {visiblePolls.map((poll) => (
            <div key={poll.question}>
              <PollPreview poll={poll} variant="feed" {...getVoteProps(poll.id)} />
            </div>
          ))}
        </div>

        {visiblePolls.length === 0 && (
          <p className="py-16 text-center text-white/40">
            No active polls in this category yet.
          </p>
        )}
      </div>
    </section>
  );
}
