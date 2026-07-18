import { AppButtonLink } from "@/components/ui/button";
import { ThemeLogo } from "@/components/theme-logo";

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-app-bg px-5 text-app-fg">
      <div className="decorative-blur absolute -left-40 -top-40 h-[520px] w-[520px] rounded-full bg-accent/25 blur-[130px]" />
      <div className="decorative-blur absolute -bottom-40 -right-40 h-[440px] w-[440px] rounded-full bg-accent-alt/20 blur-[120px]" />
      <div className="decorative-blur absolute left-1/2 top-1/2 h-[320px] w-[320px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-info/10 blur-[100px]" />

      <div className="relative text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-surface-soft px-4 py-2 text-xs font-semibold text-muted backdrop-blur-md">
          <span className="size-2 animate-pulse rounded-full bg-danger" />
          <ThemeLogo
            alt="Plebiq"
            width={1266}
            height={435}
            className="h-5 w-auto"
          />
        </div>

        <div
          className="select-none text-[clamp(6rem,20vw,13rem)] font-bold leading-none tracking-tight"
          aria-hidden="true"
        >
          <span className="bg-gradient-to-br from-accent via-accent-alt to-accent bg-clip-text text-transparent drop-shadow-[0_0_80px_var(--glow-accent)]">
            404
          </span>
        </div>

        <h1 className="mt-1 text-2xl font-bold sm:text-3xl">
          This poll doesn&apos;t exist
        </h1>
        <p className="mx-auto mt-4 max-w-sm text-base leading-7 text-muted">
          The page you&apos;re looking for has ended, moved, or never existed.
          Let&apos;s get you back on track.
        </p>

        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <AppButtonLink
            className="group"
            href="/"
            size="lg"
          >
            Back to home
            <span className="grid size-6 place-items-center rounded-full bg-foreground text-background transition group-hover:translate-x-0.5">
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
          </AppButtonLink>
          <AppButtonLink
            href="/#feed"
            variant="secondary"
            size="lg"
          >
            Browse polls
          </AppButtonLink>
        </div>
      </div>

      {/* Decorative blurred poll card in background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-12 left-1/2 -translate-x-1/2 w-72 select-none opacity-[0.06] blur-sm"
      >
        <div className="rounded-2xl border border-border bg-surface-soft p-5 space-y-3">
          <div className="h-3 w-2/3 rounded-full bg-subtle" />
          <div className="h-2 w-full rounded-full bg-faint" />
          <div className="space-y-2 pt-2">
            {[55, 30, 15].map((w, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="size-5 rounded-full border border-border" />
                <div className="flex-1 space-y-1">
                  <div className="h-2 w-1/3 rounded-full bg-muted" />
                  <div className="h-1 rounded-full bg-faint" style={{ width: `${w}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
