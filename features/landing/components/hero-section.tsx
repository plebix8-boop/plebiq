import {
  AnimatePresence,
  motion,
  type MotionValue,
} from "framer-motion";
import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { heroPhrases } from "../data";
import type { FeaturedPoll } from "../data";
import type { VoteProps } from "../landing-page";
import { LiveVotesTicker } from "./live-votes-ticker";
import { PollPreview } from "./poll-preview";
import { SignInNavButton, UserAvatarMenu } from "./user-avatar-menu";
import { useAuth } from "@/contexts/auth-context";
import { AppButton } from "@/components/ui/button";

type HeroSectionProps = {
  scrollYProgress: MotionValue<number>;
  featuredPoll: FeaturedPoll;
  voteProps: VoteProps;
};

type TypePhase = "typing" | "pause" | "deleting";

const HERO_PREVIEW_WIDTH = 624;
const HERO_PREVIEW_FALLBACK_HEIGHT = 860;
const HERO_PREVIEW_MIN_SCALE = 0.58;
const HERO_PREVIEW_MAX_SCALE = 1;

function isLetter(char: string) {
  const code = char.toLowerCase().charCodeAt(0);
  return code >= 97 && code <= 122;
}

function cleanWord(word: string) {
  return word
    .split("")
    .filter((char) => isLetter(char))
    .join("")
    .toLowerCase();
}

export function HeroSection({ featuredPoll, voteProps }: HeroSectionProps) {
  const { user } = useAuth();
  const [displayText, setDisplayText] = useState("");
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [phase, setPhase] = useState<TypePhase>("typing");
  const [showPollModal, setShowPollModal] = useState(false);
  const [previewScale, setPreviewScale] = useState(HERO_PREVIEW_MAX_SCALE);
  const [previewHeight, setPreviewHeight] = useState(HERO_PREVIEW_FALLBACK_HEIGHT);
  const charIndexRef = useRef(0);
  const timerRef = useRef<number | null>(null);
  const previewSlotRef = useRef<HTMLDivElement>(null);
  const previewFrameRef = useRef<HTMLDivElement>(null);

  function scrollToFeed() {
    window.scrollTo({ top: window.innerHeight, behavior: "smooth" });
  }

  useEffect(() => {
    const currentPhrase = heroPhrases[phraseIndex].text;

    if (phase === "typing") {
      const typeNext = () => {
        charIndexRef.current += 1;
        setDisplayText(currentPhrase.slice(0, charIndexRef.current));

        if (charIndexRef.current >= currentPhrase.length) {
          setPhase("pause");
          return;
        }

        const remaining = currentPhrase.length - charIndexRef.current;
        const delay =
          remaining <= 3 ? 120 + Math.random() * 80 : 55 + Math.random() * 70;
        timerRef.current = window.setTimeout(typeNext, delay);
      };

      timerRef.current = window.setTimeout(typeNext, 90);
    }

    if (phase === "pause") {
      timerRef.current = window.setTimeout(() => setPhase("deleting"), 1600);
    }

    if (phase === "deleting") {
      const deleteNext = () => {
        charIndexRef.current -= 1;
        setDisplayText(currentPhrase.slice(0, Math.max(0, charIndexRef.current)));

        if (charIndexRef.current <= 0) {
          charIndexRef.current = 0;
          setPhraseIndex((previousIndex) => (previousIndex + 1) % heroPhrases.length);
          setPhase("typing");
          return;
        }

        timerRef.current = window.setTimeout(deleteNext, 25 + Math.random() * 35);
      };

      timerRef.current = window.setTimeout(deleteNext, 200);
    }

    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, [phase, phraseIndex]);

  useEffect(() => {
    let frame = 0;

    function updatePreviewScale() {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        const slotWidth =
          previewSlotRef.current?.getBoundingClientRect().width ??
          HERO_PREVIEW_WIDTH;
        const naturalHeight =
          previewFrameRef.current?.scrollHeight || HERO_PREVIEW_FALLBACK_HEIGHT;
        const availableHeight = Math.max(360, window.innerHeight - 84);
        const nextScale = Math.min(
          HERO_PREVIEW_MAX_SCALE,
          Math.max(
            HERO_PREVIEW_MIN_SCALE,
            Math.min(slotWidth / HERO_PREVIEW_WIDTH, availableHeight / naturalHeight),
          ),
        );

        setPreviewHeight(naturalHeight);
        setPreviewScale((currentScale) =>
          Math.abs(currentScale - nextScale) > 0.01 ? nextScale : currentScale,
        );
      });
    }

    updatePreviewScale();
    window.addEventListener("resize", updatePreviewScale);
    window.visualViewport?.addEventListener("resize", updatePreviewScale);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", updatePreviewScale);
      window.visualViewport?.removeEventListener("resize", updatePreviewScale);
    };
  }, [featuredPoll]);

  const renderText = () => {
    const highlights = heroPhrases[phraseIndex].highlight.map((word) =>
      word.toLowerCase(),
    );
    const parts: Array<{ text: string; type: "word" | "space" }> = [];
    let currentWord = "";

    displayText.split("").forEach((char) => {
      if (char === " ") {
        if (currentWord) {
          parts.push({ text: currentWord, type: "word" });
          currentWord = "";
        }
        parts.push({ text: char, type: "space" });
        return;
      }

      currentWord += char;
    });

    if (currentWord) {
      parts.push({ text: currentWord, type: "word" });
    }

    return parts.map((part, partIndex) => {
      if (part.type === "space") {
        return <span key={partIndex}>{part.text}</span>;
      }

      const word = cleanWord(part.text);
      const shouldHighlight = highlights.some((highlightWord) => {
        if (!word) {
          return false;
        }

        return highlightWord.startsWith(word) || word.startsWith(highlightWord);
      });

      return part.text.split("").map((char, charIndex) => (
        <span
          className={
            shouldHighlight
              ? "bg-gradient-to-r from-accent to-accent-alt bg-clip-text font-semibold text-transparent drop-shadow-[0_0_8px_var(--glow-accent)]"
              : "text-hero-text"
          }
          key={`${partIndex}-${charIndex}`}
        >
          {char}
        </span>
      ));
    });
  };

  return (
    <section
      className="fixed inset-0 z-10 h-screen overflow-hidden bg-hero-bg px-5 py-6 text-hero-text sm:px-8 lg:px-10"
      id="hero"
    >
      <div className="pointer-events-none absolute -left-40 -top-40 h-[520px] w-[520px] rounded-full bg-accent/25 blur-[130px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-[440px] w-[440px] rounded-full bg-accent-alt/20 blur-[120px]" />

      <div className="absolute left-5 top-5 z-40 sm:left-8 sm:top-6">
        <Image
          alt="Plebiq"
          src="/logo.png"
          width={1266}
          height={435}
          className="h-9 w-auto sm:h-10"
          priority
        />
      </div>

      {/* Top-right nav: avatar or sign-in */}
      <div className="absolute right-5 top-5 z-40 sm:right-8 sm:top-6">
        {user ? (
          <UserAvatarMenu />
        ) : (
          <SignInNavButton />
        )}
      </div>

      <LiveVotesTicker />

      <motion.div
        className="relative z-10 mx-auto flex min-h-[172svh] w-full max-w-[1600px] flex-col items-center justify-start gap-10 pb-12 pt-[8svh] lg:grid lg:min-h-[calc(100vh-48px)] lg:grid-cols-[minmax(0,0.94fr)_minmax(500px,624px)] lg:justify-center lg:gap-12 lg:py-0 xl:gap-16"
      >
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="flex min-h-[86svh] w-full max-w-[760px] flex-col items-center justify-center text-center lg:block lg:min-h-0 lg:text-left"
          initial={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-hero-pill-bg px-4 py-2 text-xs text-hero-pill-text">
            <span className="size-2 rounded-full bg-hero-pill-dot" />
            Live global polling platform
          </div>

          <div className="flex min-h-[132px] items-center sm:min-h-[150px] lg:min-h-[164px] xl:min-h-[188px]">
            <h1 className="text-[2.65rem] font-semibold leading-[1.02] tracking-normal sm:text-[3.25rem] lg:text-[4rem] xl:text-[4.625rem]">
              {renderText()}
              <span className="ml-1 inline-block h-[1em] w-[3px] animate-pulse rounded bg-accent" />
            </h1>
          </div>

          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-hero-text-muted lg:mx-0">
            Speak up. The world is listening and deciding.
          </p>

          <div className="mt-7 flex flex-col items-center gap-3 sm:flex-row lg:justify-start">
            <AppButton
              className="group"
              onClick={() => setShowPollModal(true)}
              size="lg"
              type="button"
            >
              Start voting
              <span className="grid size-6 place-items-center rounded-full bg-hero-button-primary-icon-bg text-hero-button-primary-icon-text transition group-hover:translate-x-0.5">
                <svg
                  aria-hidden="true"
                  className="size-3.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  viewBox="0 0 24 24"
                >
                  <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </AppButton>
            <AppButton
              onClick={scrollToFeed}
              variant="secondary"
              size="lg"
              type="button"
            >
              See active polls
            </AppButton>
          </div>

          <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-hero-button-secondary-border bg-hero-button-secondary-bg px-4 py-2 text-xs font-semibold text-hero-text-muted backdrop-blur-md lg:hidden">
            <span className="size-1.5 rounded-full bg-accent shadow-[0_0_14px_var(--glow-accent)]" />
            Live poll below
          </div>
        </motion.div>

        <motion.div
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="relative flex w-full max-w-[min(92vw,624px)] justify-center lg:max-w-[624px] lg:justify-end"
          initial={{ opacity: 0, scale: 0.94, y: 24 }}
          ref={previewSlotRef}
          transition={{ delay: 0.15 }}
        >
          <div
            className="relative"
            style={
              {
                height: previewHeight * previewScale,
                width: HERO_PREVIEW_WIDTH * previewScale,
              } as CSSProperties
            }
          >
            <div
              className="w-[624px] origin-top"
              ref={previewFrameRef}
              style={
                {
                  transform: `scale(${previewScale})`,
                  transformOrigin: "top center",
                } as CSSProperties
              }
            >
              <PollPreview poll={featuredPoll} {...voteProps} />
            </div>
          </div>
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {showPollModal && (
          <motion.div
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-50 flex items-center justify-center p-5"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            onClick={() => setShowPollModal(false)}
            style={{
              backdropFilter: "blur(16px)",
              background: "radial-gradient(circle at center, var(--shadow-soft) 0%, var(--shadow-soft) 100%)",
              WebkitBackdropFilter: "blur(16px)",
            }}
          >
            <motion.div
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="flex max-h-[calc(100svh-48px)] w-[min(92vw,620px)] flex-col overflow-hidden"
              exit={{ opacity: 0, scale: 0.94, y: 16 }}
              initial={{ opacity: 0, scale: 0.9, y: 32 }}
              onClick={(e) => e.stopPropagation()}
              transition={{ type: "spring", stiffness: 340, damping: 30 }}
            >
              <div className="mb-3 flex shrink-0 items-center justify-between px-1">
                <p className="text-sm font-semibold text-hero-modal-label-text">Featured poll</p>
                <button
                  className="grid size-8 place-items-center rounded-full bg-hero-modal-close-bg text-hero-modal-close-text transition hover:bg-hero-button-secondary-bg-hover hover:text-hero-text"
                  onClick={() => setShowPollModal(false)}
                  type="button"
                >
                  ✕
                </button>
              </div>
              <div className="min-h-0 overflow-y-auto pr-1 [scrollbar-width:thin]">
                <PollPreview poll={featuredPoll} {...voteProps} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
