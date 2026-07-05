import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";

type AuthSplitLayoutProps = {
  formEyebrow: string;
  formTitle: string;
  formDescription: string;
  children: ReactNode;
  footer?: ReactNode;
};

const pollOptions = [
  { label: "One-click sharing", pct: 46, accent: "from-sky-300 to-cyan-400" },
  { label: "Audience segments", pct: 32, accent: "from-violet-300 to-fuchsia-400" },
  { label: "Result exports", pct: 22, accent: "from-amber-200 to-orange-400" },
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
        <div className="pointer-events-none absolute -left-32 top-1/4 h-[500px] w-[500px] rounded-full bg-violet-700/20 blur-[120px]" />
        <div className="pointer-events-none absolute -right-32 bottom-1/4 h-[400px] w-[400px] rounded-full bg-sky-700/15 blur-[110px]" />
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[280px] w-[280px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-fuchsia-700/10 blur-[90px]" />

        <div className="relative z-10 max-w-[450px]">

          {/* Headline */}
          <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.24em] text-fuchsia-400/75">
            Live global polling
          </p>
          <h2 className="text-4xl font-black leading-[1.06] text-white xl:text-5xl">
            The world votes.{" "}
            <span className="bg-gradient-to-r from-fuchsia-400 via-violet-400 to-sky-400 bg-clip-text text-transparent">
              You decide.
            </span>
          </h2>
          <p className="mt-3 text-sm leading-7 text-white/45">
            Cast your vote on live questions and unlock real results instantly.
          </p>

          {/* Poll card — styled like PollPreview */}
          <div className="mt-8 overflow-hidden rounded-[1.55rem] bg-white/[0.06] shadow-[0_14px_45px_var(--shadow-soft)]">

            {/* Image area */}
            <div className="relative h-[175px] overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt=""
                className="h-full w-full object-cover"
                src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1600&auto=format&fit=crop"
              />
              {/* overlays */}
              <div className="absolute inset-0 bg-black/40" />
              <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/30 to-black/65" />

              {/* LIVE badge */}
              <div className="absolute left-4 top-4 inline-flex h-7 items-center gap-2 rounded-full bg-white/15 px-3 backdrop-blur-md">
                <span className="relative flex size-2.5 shrink-0">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-60" />
                  <span className="relative inline-flex size-2.5 rounded-full bg-red-400 shadow-[0_0_10px_var(--danger-glow)]" />
                </span>
                <span className="text-[10px] font-bold leading-none tracking-widest text-white/80">
                  LIVE
                </span>
              </div>

              {/* Category badge */}
              <div className="absolute right-4 top-4 inline-flex h-7 items-center rounded-full border border-white/12 bg-white/15 px-3 text-[10px] font-bold uppercase leading-none tracking-[0.16em] text-white/78 backdrop-blur-md">
                Product
              </div>
            </div>

            {/* Card body */}
            <div className="space-y-4 p-5">
              <div>
                <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">
                  Featured live poll
                </p>
                <h3 className="text-lg font-semibold leading-[1.3] text-white">
                  Which product decision should the team validate first?
                </h3>
              </div>

              {/* Results-reveal badge */}
              <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/72">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img alt="" className="size-4 object-contain opacity-80" src="/privacy-icon.ico" />
                Results reveal after voting
              </div>

              {/* Vote options — blurred results to entice sign-in */}
              <div className="space-y-2">
                {pollOptions.map((opt) => (
                  <div key={opt.label}>
                    <div className="mb-1.5 flex items-center justify-between text-[11px] font-semibold text-white/52">
                      <span>{opt.label}</span>
                      <span className="blur-[3px]">??%</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${opt.accent} opacity-80 blur-[2px]`}
                        style={{ width: `${opt.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-[10px] text-white/30">
                Sign in to reveal live results &middot; 41,284 votes so far
              </p>
            </div>
          </div>

          {/* Stat row */}
          {/* <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
                Active polls
              </p>
              <p className="mt-1.5 text-[1.5rem] font-black leading-none text-white">2,841</p>
              <p className="mt-1 text-[10px] text-fuchsia-400/70">↑ 124 launched today</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
                Votes today
              </p>
              <p className="mt-1.5 text-[1.5rem] font-black leading-none text-white">3.2M</p>
              <p className="mt-1 text-[10px] text-sky-400/70">↑ 18% vs yesterday</p>
            </div>
          </div> */}
        </div>
      </div>

      {/* ── Right: Form panel ── */}
      <div className="flex min-h-screen flex-col items-center overflow-y-auto bg-white px-8 py-8 sm:px-12">

        {/* Top nav */}
        <div className="flex w-full items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2.5 transition hover:opacity-80"
          >
            <Image
              alt="Plebiq"
              src="/logo.png"
              width={1266}
              height={435}
              className="h-9 w-auto"
              priority
            />
          </Link>
          <Link
            href="/"
            className="rounded-full border border-button-secondary-border bg-button-secondary-bg px-3 py-2 text-xs font-semibold text-button-secondary-text transition hover:bg-button-secondary-bg-hover hover:text-button-secondary-text"
          >
            ← Back
          </Link>
        </div>

        {/* Form area */}
        <div className="flex flex-1 flex-col justify-center py-10">
          <div className="mx-auto w-full max-w-sm">
            <p className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-violet-600">
              {formEyebrow}
            </p>
            <h1 className="text-2xl font-black leading-tight text-slate-950 sm:text-3xl">
              {formTitle}
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-500">{formDescription}</p>

            <div className="mt-8 space-y-4">{children}</div>

            {footer && (
              <div className="mt-7 border-t border-slate-100 pt-6 text-sm text-slate-500">
                {footer}
              </div>
            )}
          </div>
        </div>

        {/* Bottom tagline */}
        <p className="w-full text-center text-xs text-slate-300">
          &copy; {new Date().getFullYear()} Plebiq. All rights reserved.
        </p>
      </div>

    </div>
  );
}
