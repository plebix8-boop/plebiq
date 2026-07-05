"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-app-bg px-5 text-white">
      <div className="pointer-events-none absolute -left-40 -top-40 h-[520px] w-[520px] rounded-full bg-rose-900/20 blur-[130px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-[440px] w-[440px] rounded-full bg-purple-900/20 blur-[120px]" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-900/10 blur-[90px]" />

      <div className="relative w-full max-w-md text-center">
        {/* Error badge */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-red-400/20 bg-red-400/10 px-4 py-2 text-xs font-semibold text-red-300 backdrop-blur-md">
          <span className="relative flex size-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-50" />
            <span className="relative inline-flex size-2 rounded-full bg-red-400" />
          </span>
          Something went wrong
        </div>

        {/* Icon */}
        <div className="mx-auto mb-5 grid size-16 place-items-center rounded-2xl border border-white/10 bg-white/[0.06] shadow-[0_14px_40px_var(--shadow-soft),inset_0_1px_0_var(--fg-8)]">
          <svg
            className="size-8 text-white/60"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
            />
          </svg>
        </div>

        <h1 className="text-2xl font-black sm:text-3xl">Unexpected error</h1>
        <p className="mx-auto mt-4 max-w-sm text-base leading-7 text-white/48">
          Something broke on our end. You can try again — it usually fixes
          itself.
        </p>

        {error.digest && (
          <p className="mt-3 font-mono text-[11px] text-white/22">
            Error ID: {error.digest}
          </p>
        )}

        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <button
            className="group inline-flex h-12 items-center gap-2 rounded-2xl bg-white px-6 text-sm font-semibold text-slate-950 shadow-[0_18px_50px_var(--fg-14),0_0_0_1px_var(--fg-22)] transition duration-200 hover:-translate-y-0.5"
            onClick={reset}
            type="button"
          >
            Try again
            <span className="grid size-6 place-items-center rounded-full bg-black text-white transition group-hover:rotate-180 duration-300">
              ↺
            </span>
          </button>
          <Link
            className="inline-flex h-12 items-center justify-center rounded-2xl border border-white/15 bg-white/8 px-6 text-sm font-semibold text-white/80 shadow-[inset_0_1px_0_var(--fg-8)] backdrop-blur-md transition duration-200 hover:border-white/25 hover:bg-white/14 hover:text-white"
            href="/"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
