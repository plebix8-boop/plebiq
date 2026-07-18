import { useEffect, useRef, useState } from "react";
import type { FeaturedPoll } from "../data";
import type { VoteProps } from "../landing-page";
import { PollPreview } from "./poll-preview";

type FeedSectionProps = {
  polls: FeaturedPoll[];
  categories: string[];
  getVoteProps: (pollId: string | undefined) => VoteProps;
  onShareResults: (poll: FeaturedPoll, percentages: string[]) => void;
};

export function FeedSection({ polls, categories, getVoteProps, onShareResults }: FeedSectionProps) {
  const [activeCategory, setActiveCategory] = useState("All");
  const categoryListRef = useRef<HTMLDivElement>(null);
  const [categoryScroll, setCategoryScroll] = useState({
    canScrollLeft: false,
    canScrollRight: false,
  });

  useEffect(() => {
    const categoryList = categoryListRef.current;
    if (!categoryList) return;

    let frame = 0;
    const updateScrollControls = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        const maxScrollLeft = categoryList.scrollWidth - categoryList.clientWidth;
        const nextState = {
          canScrollLeft: categoryList.scrollLeft > 2,
          canScrollRight: categoryList.scrollLeft < maxScrollLeft - 2,
        };

        setCategoryScroll((currentState) =>
          currentState.canScrollLeft === nextState.canScrollLeft &&
          currentState.canScrollRight === nextState.canScrollRight
            ? currentState
            : nextState,
        );
      });
    };

    updateScrollControls();
    categoryList.addEventListener("scroll", updateScrollControls, { passive: true });
    const resizeObserver = new ResizeObserver(updateScrollControls);
    resizeObserver.observe(categoryList);

    return () => {
      window.cancelAnimationFrame(frame);
      categoryList.removeEventListener("scroll", updateScrollControls);
      resizeObserver.disconnect();
    };
  }, [categories]);

  function scrollCategories(direction: "left" | "right") {
    const categoryList = categoryListRef.current;
    if (!categoryList) return;

    categoryList.scrollBy({
      behavior: "smooth",
      left: categoryList.clientWidth * 0.7 * (direction === "left" ? -1 : 1),
    });
  }

  const visiblePolls =
    activeCategory === "All"
      ? polls
      : polls.filter((poll) => poll.category === activeCategory);

  return (
    <section
      className="relative z-20 min-h-screen bg-app-bg px-5 pt-6 pb-12 pb-16 text-app-fg sm:px-8 lg:pt-12 lg:pb-24"
      id="feed"
    >
      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-8 flex flex-col gap-5 sm:mb-10 lg:flex-row lg:items-end lg:justify-between">
          <div>
            {/* <p className="text-sm font-bold uppercase tracking-[0.18em] text-accent">
              Feed
            </p> */}
            <h2 className="mt-3 text-4xl font-bold leading-tight sm:text-5xl">
              Active polls
            </h2>
            <p className="mt-3 max-w-2xl text-base leading-7 text-muted">
              Explore live questions moving across product, culture, tech, and
              world conversations.
            </p>
          </div>

          <div className="relative min-w-0">
            <div
              className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              ref={categoryListRef}
            >
              {categories.map((category) => (
                <button
                  className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition ${activeCategory === category
                    ? "border-transparent bg-filter-active-bg text-filter-active-text"
                    : "border-border bg-filter-idle-bg text-filter-idle-text hover:bg-filter-idle-bg-hover hover:text-filter-idle-text-hover"
                    }`}
                  key={category}
                  onClick={(event) => {
                    setActiveCategory(category);
                    event.currentTarget.scrollIntoView({
                      behavior: "smooth",
                      block: "nearest",
                      inline: "center",
                    });
                  }}
                  type="button"
                >
                  {category}
                </button>
              ))}
            </div>

            {categoryScroll.canScrollLeft && (
              <div className="pointer-events-none absolute bottom-1 left-0 top-0 flex w-12 items-center bg-gradient-to-r from-app-bg via-app-bg/90 to-transparent pr-2">
                <button
                  aria-label="Scroll categories left"
                  className="pointer-events-auto inline-flex size-8 items-center justify-center rounded-full border border-button-secondary-border bg-button-secondary-bg text-button-secondary-text shadow-[0_6px_18px_var(--shadow-soft)] transition hover:bg-button-secondary-bg-hover"
                  onClick={() => scrollCategories("left")}
                  type="button"
                >
                  <svg aria-hidden="true" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="m15 18-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            )}

            {categoryScroll.canScrollRight && (
              <div className="pointer-events-none absolute bottom-1 right-0 top-0 flex w-12 items-center justify-end bg-gradient-to-l from-app-bg via-app-bg/90 to-transparent pl-2">
                <button
                  aria-label="Scroll categories right"
                  className="pointer-events-auto inline-flex size-8 items-center justify-center rounded-full border border-button-secondary-border bg-button-secondary-bg text-button-secondary-text shadow-[0_6px_18px_var(--shadow-soft)] transition hover:bg-button-secondary-bg-hover"
                  onClick={() => scrollCategories("right")}
                  type="button"
                >
                  <svg aria-hidden="true" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="m9 18 6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {visiblePolls.map((poll) => (
            <div
              key={poll.id ?? poll.question}
              style={{
                containIntrinsicSize: "640px",
                contentVisibility: "auto",
              }}
            >
              <PollPreview onShareResults={onShareResults} poll={poll} variant="feed" {...getVoteProps(poll.id)} />
            </div>
          ))}
        </div>

        {visiblePolls.length === 0 && (
          <p className="py-16 text-center text-muted">
            No active polls in this category yet.
          </p>
        )}
      </div>
    </section>
  );
}
