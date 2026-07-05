import Link from "next/link";
import Image from "next/image";

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-app-bg px-5 text-white">
      <div className="pointer-events-none absolute -left-40 -top-40 h-[520px] w-[520px] rounded-full bg-purple-700/25 blur-[130px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-[440px] w-[440px] rounded-full bg-blue-700/20 blur-[120px]" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[320px] w-[320px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-fuchsia-700/10 blur-[100px]" />

      <div className="relative text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-4 py-2 text-xs font-semibold text-white/55 backdrop-blur-md">
          <span className="size-2 animate-pulse rounded-full bg-red-400" />
          <Image
            alt="Plebiq"
            src="/logo.png"
            width={1266}
            height={435}
            className="h-5 w-auto"
          />
        </div>

        <div
          className="select-none text-[clamp(6rem,20vw,13rem)] font-black leading-none tracking-tight"
          aria-hidden="true"
        >
          <span className="bg-gradient-to-br from-pink-400 via-fuchsia-400 to-purple-500 bg-clip-text text-transparent drop-shadow-[0_0_80px_var(--glow-accent)]">
            404
          </span>
        </div>

        <h1 className="mt-1 text-2xl font-black sm:text-3xl">
          This poll doesn't exist
        </h1>
        <p className="mx-auto mt-4 max-w-sm text-base leading-7 text-white/48">
          The page you're looking for has ended, moved, or never existed.
          Let's get you back on track.
        </p>

        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            className="group inline-flex h-12 items-center gap-2 rounded-2xl bg-white px-6 text-sm font-semibold text-slate-950 shadow-[0_18px_50px_var(--fg-14),0_0_0_1px_var(--fg-22)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_22px_60px_var(--glow-accent),0_0_0_1px_var(--fg-35)]"
            href="/"
          >
            Back to home
            <span className="grid size-6 place-items-center rounded-full bg-black text-white transition group-hover:translate-x-0.5">
              →
            </span>
          </Link>
          <Link
            className="inline-flex h-12 items-center justify-center rounded-2xl border border-white/15 bg-white/8 px-6 text-sm font-semibold text-white/80 shadow-[inset_0_1px_0_var(--fg-8)] backdrop-blur-md transition duration-200 hover:border-white/25 hover:bg-white/14 hover:text-white"
            href="/#feed"
          >
            Browse polls
          </Link>
        </div>
      </div>

      {/* Decorative blurred poll card in background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-12 left-1/2 -translate-x-1/2 w-72 select-none opacity-[0.06] blur-sm"
      >
        <div className="rounded-2xl border border-white/20 bg-white/5 p-5 space-y-3">
          <div className="h-3 w-2/3 rounded-full bg-white/40" />
          <div className="h-2 w-full rounded-full bg-white/20" />
          <div className="space-y-2 pt-2">
            {[55, 30, 15].map((w, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="size-5 rounded-full border border-white/20" />
                <div className="flex-1 space-y-1">
                  <div className="h-2 w-1/3 rounded-full bg-white/30" />
                  <div className="h-1 rounded-full bg-white/10" style={{ width: `${w}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
