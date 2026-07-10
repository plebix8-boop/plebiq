"use client";

import { useEffect } from "react";
import { AppButton, AppButtonLink } from "@/components/ui/button";

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
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-app-bg px-5 text-app-fg">
      <div className="pointer-events-none absolute -left-40 -top-40 h-[520px] w-[520px] rounded-full bg-danger/20 blur-[130px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-[440px] w-[440px] rounded-full bg-accent/20 blur-[120px]" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-danger-soft blur-[90px]" />

      <div className="relative w-full max-w-md text-center">
        {/* Error badge */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-danger-soft px-4 py-2 text-xs font-semibold text-danger backdrop-blur-md">
          <span className="relative flex size-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-danger opacity-50" />
            <span className="relative inline-flex size-2 rounded-full bg-danger" />
          </span>
          Something went wrong
        </div>

        {/* Icon */}
        <div className="mx-auto mb-5 grid size-16 place-items-center rounded-2xl border border-border bg-surface-soft shadow-[0_14px_40px_var(--shadow-soft),inset_0_1px_0_var(--fg-8)]">
          <svg
            className="size-8 text-muted"
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

        <h1 className="text-2xl font-bold sm:text-3xl">Unexpected error</h1>
        <p className="mx-auto mt-4 max-w-sm text-base leading-7 text-muted">
          Something broke on our end. You can try again — it usually fixes
          itself.
        </p>

        {error.digest && (
          <p className="mt-3 font-mono text-[11px] text-faint">
            Error ID: {error.digest}
          </p>
        )}

        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <AppButton
            className="group"
            onClick={reset}
            size="lg"
            type="button"
          >
            Try again
            <span className="grid size-6 place-items-center rounded-full bg-foreground text-background transition duration-300 group-hover:rotate-180">
              <svg
                aria-hidden="true"
                className="size-3.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.3"
                viewBox="0 0 24 24"
              >
                <path d="M4 4v6h6" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M20 12a8 8 0 0 1-13.7 5.6L4 15.3" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M4.8 10A8 8 0 0 1 20 12" strokeLinecap="round" />
              </svg>
            </span>
          </AppButton>
          <AppButtonLink
            href="/"
            variant="secondary"
            size="lg"
          >
            Go home
          </AppButtonLink>
        </div>
      </div>
    </div>
  );
}
