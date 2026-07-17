import Link from "next/link";
import type { ReactNode } from "react";
import { ThemeLogo } from "@/components/theme-logo";

type AuthSplitLayoutProps = {
  formEyebrow: string;
  formTitle: string;
  formDescription: string;
  children: ReactNode;
  footer?: ReactNode;
};

const pollOptions = [
  { label: "One-click sharing", pct: 46, accent: "linear-gradient(90deg, var(--accent), var(--accent-alt))" },
  { label: "Audience segments", pct: 32, accent: "linear-gradient(90deg, var(--accent-alt), var(--accent))" },
  { label: "Result exports", pct: 22, accent: "linear-gradient(90deg, var(--warning), var(--accent))" },
];

export function AuthSplitLayout({
  formEyebrow,
  formTitle,
  formDescription,
  children,
  footer,
}: AuthSplitLayoutProps) {
  return (
    <div className="h-screen overflow-hidden lg:grid lg:grid-cols-[3fr_2fr]">

      {/* ── Left: Showcase panel ── */}
      <div className="relative hidden overflow-hidden bg-app-bg lg:flex lg:flex-col lg:items-center lg:justify-center lg:px-8">

        {/* Glow blobs */}
        <div className="pointer-events-none absolute -left-32 top-1/4 h-[500px] w-[500px] rounded-full bg-accent/20 blur-[120px]" />
        <div className="pointer-events-none absolute -right-32 bottom-1/4 h-[400px] w-[400px] rounded-full bg-accent-alt/15 blur-[110px]" />
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[280px] w-[280px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-info/10 blur-[90px]" />

        <div className="relative z-10 max-w-[450px]">

          {/* Headline */}
          {/* <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.24em] text-accent">
            Live global polling
          </p> */}
          <h2 className="text-4xl font-bold leading-[1.06] text-app-fg xl:text-5xl">
            The world votes.{" "}
            <span className="bg-gradient-to-r from-accent via-accent-alt to-accent bg-clip-text text-transparent">
              You decide.
            </span>
          </h2>
          <p className="mt-3 text-sm leading-7 text-muted">
            Cast your vote on live questions and unlock real results instantly.
          </p>

          {/* Poll card — styled like PollPreview */}
          <div className="mt-8 overflow-hidden rounded-[1.55rem] bg-surface-soft shadow-[0_14px_45px_var(--shadow-soft)]">

            {/* Image area */}
            <div className="relative h-[175px] overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt=""
                className="h-full w-full object-cover"
                src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1600&auto=format&fit=crop"
              />
              {/* LIVE badge */}
              <div className="absolute left-4 top-4 inline-flex h-7 items-center gap-2 rounded-full bg-poll-badge-bg px-3 backdrop-blur-md">
                <span className="relative flex size-2.5 shrink-0">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-button-primary-bg opacity-60" />
                  <span className="relative inline-flex size-2.5 rounded-full bg-button-primary-bg shadow-[0_0_10px_var(--glow-accent)]" />
                </span>
                <span className="text-[10px] font-bold leading-none tracking-widest text-poll-badge-text">
                  LIVE
                </span>
              </div>

              {/* Category badge */}
              <div className="absolute right-4 top-4 inline-flex h-7 items-center rounded-full border border-transparent bg-button-primary-bg px-3 text-[10px] font-bold uppercase leading-none tracking-[0.16em] text-button-primary-text backdrop-blur-md">
                Product
              </div>
            </div>

            {/* Card body */}
            <div className="space-y-4 p-5">
              <div>
                <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-muted">
                  Featured live poll
                </p>
                <h3 className="text-lg font-semibold leading-[1.3] text-app-fg">
                  Which product decision should the team validate first?
                </h3>
              </div>

              {/* Results-reveal badge */}
              <div className="inline-flex items-center gap-1.5 rounded-full bg-surface-muted px-3 py-1 text-xs font-medium text-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img alt="" className="size-4 object-contain opacity-80" src="/privacy-icon.ico" />
                Results reveal after voting
              </div>

              {/* Vote options — blurred results to entice sign-in */}
              <div className="space-y-2">
                {pollOptions.map((opt) => (
                  <div key={opt.label}>
                    <div className="mb-1.5 flex items-center justify-between text-[11px] font-semibold text-muted">
                      <span>{opt.label}</span>
                      <span className="blur-[3px]">??%</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-surface-muted">
                      <div
                        className="h-full rounded-full opacity-80 blur-[2px]"
                        style={{ background: opt.accent, width: `${opt.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-[10px] text-faint">
                Sign in to reveal live results &middot; 41,284 votes so far
              </p>
            </div>
          </div>

          {/* Stat row */}
          {/* <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-border bg-surface-soft p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-faint">
                Active polls
              </p>
              <p className="mt-1.5 text-[1.5rem] font-bold leading-none text-app-fg">2,841</p>
              <p className="mt-1 text-[10px] text-accent">↑ 124 launched today</p>
            </div>
            <div className="rounded-xl border border-border bg-surface-soft p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-faint">
                Votes today
              </p>
              <p className="mt-1.5 text-[1.5rem] font-bold leading-none text-app-fg">3.2M</p>
              <p className="mt-1 text-[10px] text-accent-alt">↑ 18% vs yesterday</p>
            </div>
          </div> */}
        </div>
      </div>

      {/* ── Right: Form panel ── */}
      <div className="flex min-h-screen flex-col items-center overflow-y-auto bg-background px-8 py-8 text-foreground sm:px-12">

        {/* Top nav */}
        <div className="flex w-full items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2.5 transition hover:opacity-80"
          >
            <ThemeLogo
              alt="Plebiq"
              width={1266}
              height={435}
              className="h-15 w-auto"
              priority
            />
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-1.5 rounded-full border border-button-secondary-border bg-button-secondary-bg px-3 py-2 text-xs font-semibold leading-none text-button-secondary-text transition hover:bg-button-secondary-bg-hover hover:text-button-secondary-text"
          >
            <svg
              aria-hidden="true"
              className="size-3.5 shrink-0"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                d="M19 12H5m6-6-6 6 6 6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>Back</span>
          </Link>
        </div>

        {/* Form area */}
        <div className="flex flex-1 flex-col justify-center py-10">
          <div className="mx-auto w-full max-w-sm">
            <p className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-accent">
              {formEyebrow}
            </p>
            <h1 className="text-2xl font-bold leading-tight text-foreground sm:text-3xl">
              {formTitle}
            </h1>
            <p className="mt-2 text-sm leading-6 text-muted">{formDescription}</p>

            <div className="mt-8 space-y-4">{children}</div>

            {footer && (
              <div className="mt-7 border-t border-border pt-6 text-center text-sm text-muted sm:text-left">
                {footer}
              </div>
            )}
          </div>
        </div>

        {/* Bottom tagline */}
        {/* <p className="w-full text-center text-xs text-faint">
          &copy; {new Date().getFullYear()} Plebiq. All rights reserved.
        </p> */}
      </div>

    </div>
  );
}
