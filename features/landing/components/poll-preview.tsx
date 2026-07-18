"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { useAuth } from "@/contexts/auth-context";
import { castVote } from "../actions";
import type { VoteState } from "../landing-page";
import type { FeaturedPoll } from "../data";
import { AppButton } from "@/components/ui/button";
import { useElementInView, usePageVisible } from "@/hooks/use-runtime-activity";

const ShareResultsModal = dynamic(
  () => import("./share-results-modal").then((module) => module.ShareResultsModal),
  { ssr: false },
);

type PollPreviewProps = {
  poll: FeaturedPoll;
  variant?: "hero" | "feed" | "management";
  // Provided by LandingPage after the single batch fetch.
  // undefined = still resolving | null = no prior vote | string = optionId already voted
  existingVoteOptionId?: VoteState;
  // Fresh server percentages; falls back to poll.options[].previewWidth when absent
  freshOptionWidths?: string[];
  onShareResults?: (poll: FeaturedPoll, percentages: string[]) => void;
  activityEnabled?: boolean;
};

export function PollPreview({
  poll,
  variant = "hero",
  existingVoteOptionId,
  freshOptionWidths,
  onShareResults,
  activityEnabled = true,
}: PollPreviewProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // ── Auth from context — zero DB calls ──────────────────────────────────────
  const { isSignedIn, isAuthLoading } = useAuth();

  // ── Local interaction state ────────────────────────────────────────────────
  const [selected, setSelected] = useState<number | null>(null);
  const [displayedWidths, setDisplayedWidths] = useState<string[]>(
    freshOptionWidths ?? poll.options.map((o) => o.previewWidth),
  );
  const [voteError, setVoteError] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const { isInView, ref: viewportRef } = useElementInView<HTMLDivElement>();
  const isPageVisible = usePageVisible();
  const shouldReduceMotion = useReducedMotion();
  const isMotionActive =
    activityEnabled && isInView && isPageVisible && !shouldReduceMotion;
  const isCompact = variant !== "hero";
  const showCompactOptionDescriptions =
    variant === "management" || variant === "feed";

  // Show shimmer while auth is loading OR while parent hasn't resolved vote state yet
  // (existingVoteOptionId === undefined means the batch fetch is still in flight)
  const isLoadingVoteState = variant !== "management" && (isAuthLoading || existingVoteOptionId === undefined);
  const hasResults = selected !== null || variant === "management";

  // ── Sync parent-resolved vote state into local state ──────────────────────
  // Runs once when existingVoteOptionId transitions from undefined to a real value
  useEffect(() => {
    if (existingVoteOptionId === undefined) return;

    if (existingVoteOptionId) {
      const idx = poll.options.findIndex((o) => o.id === existingVoteOptionId);
      if (idx !== -1) setSelected(idx);
    }

    if (freshOptionWidths) {
      setDisplayedWidths(freshOptionWidths);
    }
    // Only re-run when the parent provides the resolved value for the first time
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingVoteOptionId]);

  // ── Image brightness → overlay opacity ────────────────────────────────────
  // ── Vote handler ───────────────────────────────────────────────────────────
  function handlePick(index: number) {
    if (variant === "management") {
      setSelected(index);
      return;
    }

    if (!isSignedIn) {
      setShowAuthModal(true);
      return;
    }

    // Mock data (no IDs) → visual-only selection, no DB call
    if (!poll.id || !poll.options[index].id) {
      setSelected(index);
      return;
    }

    if (isPending) return;

    setSelected(index); // optimistic
    setVoteError(null);

    startTransition(async () => {
      const result = await castVote(poll.id!, poll.options[index].id!);

      if ("error" in result) {
        setVoteError(result.error);
        return;
      }

      setDisplayedWidths(
        poll.options.map((opt) => {
          const match = result.options.find((o) => o.optionId === opt.id);
          if (!match) return opt.previewWidth;
          return `${Math.max(4, Math.round(match.votePercentage))}%`;
        }),
      );
    });
  }

  function goToSignUp() {
    setShowAuthModal(false);
    router.push("/auth/sign-up");
  }

  function goToSignIn() {
    setShowAuthModal(false);
    router.push("/auth");
  }

  return (
    <div
      className="mx-auto w-full scroll-mt-8"
      data-poll-id={poll.id}
      ref={viewportRef}
    >
      <article className="relative overflow-hidden rounded-[1.65rem] bg-poll-card-bg text-poll-card-text">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-poll-card-sheen via-transparent to-transparent" />

        {/* Banner image */}
        <div
          className={`relative overflow-hidden ${isCompact ? "h-[132px] lg:h-[148px]" : "h-[170px] lg:h-[218px]"
            }`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt=""
            className="h-full w-full object-cover"
            crossOrigin="anonymous"
            decoding="async"
            loading={isCompact ? "lazy" : "eager"}
            src={poll.image}
          />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/55 to-transparent" />

          {/* LIVE badge */}
          <div className="absolute left-4 top-4 inline-flex h-7 items-center gap-2 rounded-full bg-poll-badge-bg px-3 shadow-[0_0_8px_var(--poll-live-ring)] backdrop-blur-md">
            <span className="relative flex size-2.5 shrink-0">
              <motion.span
                animate={
                  isMotionActive
                    ? { opacity: [0.75, 0], scale: [1, 2.6] }
                    : { opacity: 0.75, scale: 1 }
                }
                className="absolute inline-flex h-full w-full rounded-full bg-button-primary-bg"
                transition={{ duration: 1.35, repeat: isMotionActive ? Infinity : 0, ease: "easeOut" }}
              />
              <motion.span
                animate={
                  isMotionActive
                    ? { opacity: [1, 0.55, 1], scale: [1, 0.82, 1] }
                    : { opacity: 1, scale: 1 }
                }
                className="relative inline-flex size-2.5 rounded-full bg-button-primary-bg shadow-[0_0_16px_var(--poll-live-glow)]"
                transition={{ duration: 1.1, repeat: isMotionActive ? Infinity : 0, ease: "easeInOut" }}
              />
            </span>
            <span className="text-[10px] font-bold leading-none tracking-widest text-poll-badge-text">
              LIVE
            </span>
          </div>

          <div className="absolute right-4 top-4 inline-flex h-7 items-center rounded-full border border-transparent bg-button-primary-bg px-3 text-[10px] font-bold uppercase leading-none tracking-[0.16em] text-button-primary-text backdrop-blur-md">
            {poll.category}
          </div>
        </div>

        {/* Body */}
        <div
          className={`relative ${isCompact ? "space-y-3 p-4" : "space-y-5 p-5 lg:p-6"
            }`}
        >
          {/* Question + description */}
          <div>
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-poll-card-subtle">
              {poll.tag}
            </p>
            <h2
              className={`font-semibold leading-[1.3] text-poll-card-text ${isCompact ? "text-lg" : "text-xl lg:text-2xl"
                }`}
            >
              {poll.question}
            </h2>
            <p
              className={`text-poll-card-muted ${isCompact
                ? "mt-2 line-clamp-2 text-xs leading-5"
                : "mt-3 text-sm leading-6"
                }`}
            >
              {poll.description}
            </p>
          </div>

          {/* Results/share action */}
          <div className={isCompact ? "sm:block" : "space-y-2"}>
            {hasResults ? (
              <button
                className="inline-flex items-center gap-2 rounded-full border border-poll-option-border bg-poll-option-bg px-3 py-1.5 text-xs font-bold text-poll-option-text transition hover:border-poll-option-border-hover hover:bg-poll-option-bg-hover"
                onClick={() => {
                  if (onShareResults) {
                    onShareResults(poll, displayedWidths);
                    return;
                  }
                  setShowShareModal(true);
                }}
                type="button"
              >
                <svg
                  aria-hidden="true"
                  className="size-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M7.5 12.5 16.5 7.5M7.5 11.5l9 5"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  />
                  <circle cx="5.5" cy="12" r="2.75" stroke="currentColor" strokeWidth="2" />
                  <circle cx="18.5" cy="6.5" r="2.75" stroke="currentColor" strokeWidth="2" />
                  <circle cx="18.5" cy="17.5" r="2.75" stroke="currentColor" strokeWidth="2" />
                </svg>
                Share results
              </button>
            ) : (
              <div className="inline-flex items-center gap-1 rounded-full bg-poll-badge-bg px-3 py-1 text-xs font-medium text-poll-badge-text">
                <span aria-hidden="true" className="grid size-6 place-items-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    alt=""
                    className="size-5 object-contain drop-shadow-[0_1px_3px_var(--fg-25)]"
                    src="/privacy-icon.ico"
                  />
                </span>
                Results reveal after voting
              </div>
            )}
          </div>

          {/* Options — skeleton while resolving, real buttons once ready */}
          <div className="space-y-2">
            {isLoadingVoteState
              ? poll.options.map((_, index) => (
                <div
                  className={`relative w-full overflow-hidden rounded-2xl border border-poll-option-border bg-poll-option-bg ${isCompact ? "p-3" : "p-4"
                    }`}
                  key={index}
                >
                  {/* Sliding shimmer */}
                  <div
                    className={`animate-shimmer pointer-events-none absolute inset-0 ${isMotionActive ? "" : "shimmer-paused"}`}
                  />
                  <div className="flex items-start gap-3">
                    <div
                      className={`mt-0.5 shrink-0 rounded-full bg-poll-radio-bg ${isCompact ? "size-6" : "size-7"
                        }`}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="h-3.5 w-2/5 rounded-full bg-poll-progress-track" />
                      {(showCompactOptionDescriptions || !isCompact) && (
                        <div className="mt-1.5 h-3 w-4/5 rounded-full bg-poll-progress-track" />
                      )}
                      <div
                        className={`rounded-full bg-poll-progress-track ${isCompact ? "mt-2 h-1" : "mt-3 h-1.5"
                          }`}
                      />
                    </div>
                  </div>
                </div>
              ))
              : poll.options.map((option, index) => {
                const isSelected = selected === index;
                const isSubmittingThis = isPending && isSelected;

                return (
                  <motion.button
                    className={`group relative w-full overflow-hidden rounded-2xl border text-left shadow-[inset_0_1px_0_var(--fg-6)] transition hover:border-poll-option-border-hover hover:bg-poll-option-bg-hover hover:shadow-[0_10px_26px_var(--shadow-soft),inset_0_1px_0_var(--fg-8)] ${isCompact ? "p-3" : "p-4"
                      } ${isSelected
                        ? "border-poll-option-border-selected bg-poll-option-bg-selected shadow-[0_14px_34px_var(--shadow-soft),0_0_0_1px_var(--fg-8),inset_0_1px_0_var(--fg-12)]"
                        : "border-poll-option-border bg-poll-option-bg"
                      } ${isPending ? "cursor-wait" : ""}`}
                    disabled={isPending}
                    key={option.label}
                    onClick={() => handlePick(index)}
                    type="button"
                    whileHover={isPending ? {} : { y: -2 }}
                    whileTap={isPending ? {} : { scale: 0.98 }}
                  >
                    <span
                      aria-hidden="true"
                      className={`absolute inset-x-4 bottom-0 h-px bg-gradient-to-r ${option.accent} opacity-35`}
                    />
                    <div className="flex items-start gap-3">
                      <span
                        className={`mt-0.5 grid shrink-0 place-items-center rounded-full border bg-poll-radio-bg transition group-hover:border-poll-option-border-hover ${isCompact ? "size-6" : "size-7"
                          } ${isSelected ? "border-poll-option-border-selected" : "border-poll-radio-border"}`}
                      >
                        <span
                          className={`rounded-full bg-gradient-to-br ${option.accent} shadow-[0_0_14px_var(--fg-14)] transition ${isCompact ? "size-2.5" : "size-3"
                            } ${isSelected ? "scale-110 opacity-100" : "scale-75 opacity-0"}`}
                        />
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="flex w-full items-start justify-between gap-4">
                          <span className="block text-sm font-semibold text-poll-option-text">
                            {option.label}
                          </span>
                          {(selected !== null || variant === "management") && (
                            <span
                              className={`shrink-0 tabular-nums text-sm font-bold leading-none text-poll-option-text ${isSubmittingThis && isMotionActive ? "animate-pulse" : ""
                                }`}
                            >
                              {displayedWidths[index]}
                            </span>
                          )}
                        </span>

                        <span
                          className={`mt-1 text-xs leading-5 text-poll-option-muted ${isCompact && !showCompactOptionDescriptions
                            ? "hidden"
                            : "block"
                            }`}
                        >
                          {option.description}
                        </span>

                        <span
                          className={`block overflow-hidden rounded-full bg-poll-progress-track ${isCompact ? "mt-2 h-1" : "mt-3 h-1.5"
                            }`}
                        >
                          {selected === null && variant !== "management" ? (
                            <motion.span
                              animate={isMotionActive ? { x: ["-120%", "300%"] } : { x: "0%" }}
                              className={`block h-full w-1/3 bg-gradient-to-r ${option.accent} opacity-45`}
                              transition={{ duration: 2, repeat: isMotionActive ? Infinity : 0 }}
                            />
                          ) : (
                            <span
                              className={`block h-full rounded-full bg-gradient-to-r ${option.accent} opacity-80 transition-[width] duration-500 ease-out`}
                              style={{ width: displayedWidths[index] }}
                            />
                          )}
                        </span>
                      </span>
                    </div>
                  </motion.button>
                );
              })}
          </div>

          {/* Vote error */}
          <AnimatePresence>
            {voteError && (
              <motion.p
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-red-400/20 bg-red-400/10 px-3 py-2 text-xs font-medium text-red-300"
                exit={{ opacity: 0, y: -4 }}
                initial={{ opacity: 0, y: 4 }}
              >
                {voteError}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Auth gate modal */}
        <AnimatePresence>
          {showAuthModal && (
            <motion.div
              animate={{ opacity: 1 }}
              className="absolute inset-0 z-20 flex items-center justify-center p-5"
              exit={{ opacity: 0 }}
              initial={{ opacity: 0 }}
              style={{
                backdropFilter: "blur(10px)",
                background:
                  "radial-gradient(circle at center, var(--shadow-soft) 0%, var(--shadow-soft) 44%, var(--shadow-soft) 100%)",
                WebkitBackdropFilter: "blur(10px)",
              }}
            >
              <motion.div
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className={`relative w-[92%] overflow-hidden border border-poll-option-border bg-poll-auth-modal-bg text-left text-poll-auth-modal-text shadow-[0_34px_110px_var(--shadow-soft),0_0_76px_var(--glow-accent)] backdrop-blur-xl ${isCompact
                  ? "max-w-sm rounded-2xl p-4"
                  : "max-w-lg rounded-[1.6rem] p-5 sm:w-[80%] sm:rounded-[2rem] sm:p-7"
                  }`}
                exit={{ opacity: 0, scale: 0.96, y: 10 }}
                initial={{ opacity: 0, scale: 0.92, y: 20 }}
                transition={{ type: "spring", stiffness: 260, damping: 22 }}
              >
                <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-[radial-gradient(circle_at_50%_0%,var(--glow-accent),transparent_68%)]" />
                <div className="pointer-events-none absolute -right-16 -top-20 size-36 rounded-full bg-sky-400/20 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-20 -left-16 size-40 rounded-full bg-fuchsia-500/20 blur-3xl" />

                <div className="relative flex items-start justify-between gap-3">
                  <div>
                    <h3
                      className={`font-bold leading-tight text-poll-auth-modal-text ${isCompact ? "text-xl" : "text-2xl sm:text-4xl"
                        }`}
                    >
                      Sign in to reveal results
                    </h3>
                    <p
                      className={`max-w-sm text-poll-auth-modal-muted ${isCompact
                        ? "mt-1.5 text-xs leading-5"
                        : "mt-2 text-sm leading-6 sm:mt-3 sm:text-base sm:leading-7"
                        }`}
                    >
                      Cast your vote first, then see how people answered.
                    </p>
                  </div>
                  <div
                    className={`grid shrink-0 place-items-center rounded-2xl bg-modal-cta-primary-bg text-modal-cta-primary-text shadow-[0_16px_42px_var(--fg-16),0_0_34px_var(--accent-alt-glow-soft)] ${isCompact ? "size-9" : "size-10 sm:size-12"
                      }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      alt=""
                      className={`object-contain ${isCompact ? "size-5" : "size-7 sm:size-8"}`}
                      src="/privacy-icon.ico"
                    />
                  </div>
                </div>

                {/* Blurred preview of results */}
                <div
                  className={`relative space-y-2 ${isCompact ? "mt-3" : "mt-5 sm:mt-7 sm:space-y-3.5"
                    }`}
                >
                  {poll.options.map((option) => (
                    <div className="opacity-80 blur-[1.5px]" key={option.label}>
                      <div className="mb-1.5 flex items-center justify-between text-[11px] font-semibold text-poll-auth-modal-muted">
                        <span>{option.label}</span>
                        <span>??%</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-poll-progress-track">
                        <div
                          className={`h-full rounded-full bg-gradient-to-r ${option.accent} opacity-80`}
                          style={{ width: option.previewWidth }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div
                  className={`relative grid gap-2 ${isCompact ? "mt-3" : "mt-5 gap-2.5 sm:mt-7"
                    }`}
                >
                  <AppButton
                    className="font-bold"
                    onClick={goToSignUp}
                    size={isCompact ? "sm" : "lg"}
                    type="button"
                  >
                    Create free account
                  </AppButton>
                  <AppButton
                    className="font-bold"
                    onClick={goToSignIn}
                    variant="secondary"
                    size={isCompact ? "sm" : "lg"}
                    type="button"
                  >
                    Sign in instead
                  </AppButton>
                </div>
                <p className="relative mt-3 text-center text-xs font-medium text-poll-auth-modal-muted">
                  Takes about 15 seconds.
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </article>
      {showShareModal ? (
        <ShareResultsModal
          isOpen
          onClose={() => setShowShareModal(false)}
          percentages={displayedWidths}
          poll={poll}
        />
      ) : null}
    </div>
  );
}
