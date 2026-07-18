"use client";

import { useMemo, useState } from "react";
import type { AdminCategory, AdminPoll } from "@/features/admin/types";

type AdminPollBrowserProps = {
  categories: AdminCategory[];
  polls: AdminPoll[];
};

const statusFilters = ["All", "draft", "live", "closed"] as const;

function formatStatus(status: AdminPoll["status"]) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function formatDate(value: string | null) {
  if (!value) {
    return "No expiry";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "No expiry";
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getStatusClasses(status: AdminPoll["status"]) {
  if (status === "live") {
    return "border-emerald-400/20 bg-emerald-400/12 text-emerald-200";
  }

  if (status === "closed") {
    return "border-white/10 bg-white/8 text-white/65";
  }

  return "border-amber-300/20 bg-amber-300/12 text-amber-100";
}

export function AdminPollBrowser({
  categories,
  polls,
}: AdminPollBrowserProps) {
  const [activeStatus, setActiveStatus] = useState<(typeof statusFilters)[number]>(
    "All",
  );

  const visiblePolls = useMemo(() => {
    return polls.filter((poll) => {
      return activeStatus === "All" || poll.status === activeStatus;
    });
  }, [activeStatus, polls]);

  return (
    <div className="space-y-6">
      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="rounded-[1.6rem] border border-white/10 bg-white/5 p-6 shadow-[0_20px_60px_var(--shadow-soft)] backdrop-blur-md">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <h1 className="text-3xl font-bold leading-tight text-white sm:text-4xl">
                Poll browser
              </h1>
              <p className="mt-3 text-sm leading-7 text-white/55">
                Browse and review polls from the admin panel with a tighter,
                dashboard-style layout.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {statusFilters.map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setActiveStatus(status)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold capitalize transition ${activeStatus === status
                      ? "bg-cyan-300 text-slate-950 shadow-[0_12px_30px_var(--accent-alt-glow)]"
                      : "bg-white/8 text-white/65 hover:bg-white/12 hover:text-white"
                    }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
          <div className="rounded-[1.6rem] border border-white/10 bg-white/5 p-5 backdrop-blur-md">
            <p className="text-xs uppercase tracking-[0.2em] text-white/40">
              Total polls
            </p>
            <p className="mt-3 text-3xl font-bold text-white">{polls.length}</p>
          </div>
          <div className="rounded-[1.6rem] border border-white/10 bg-white/5 p-5 backdrop-blur-md">
            <p className="text-xs uppercase tracking-[0.2em] text-white/40">
              Visible now
            </p>
            <p className="mt-3 text-3xl font-bold text-white">
              {visiblePolls.length}
            </p>
          </div>
          <div className="rounded-[1.6rem] border border-white/10 bg-white/5 p-5 backdrop-blur-md">
            <p className="text-xs uppercase tracking-[0.2em] text-white/40">
              Categories
            </p>
            <p className="mt-3 text-3xl font-bold text-white">
              {categories.length}
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-2 2xl:grid-cols-3">
        {visiblePolls.map((poll) => (
          <article
            key={poll.id}
            className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-surface/88 shadow-[0_22px_70px_var(--shadow-soft)]"
          >
            <div className="relative h-44 overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt=""
                className="h-full w-full object-cover"
                decoding="async"
                loading="lazy"
                src={
                  poll.image_url ||
                  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1600&auto=format&fit=crop"
                }
              />
              <div className="absolute inset-0 bg-gradient-to-t from-app-bg via-app-bg/55 to-transparent" />
              <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                <span
                  className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${getStatusClasses(
                    poll.status,
                  )}`}
                >
                  {formatStatus(poll.status)}
                </span>
                {poll.is_featured ? (
                  <span className="rounded-full border border-fuchsia-300/20 bg-fuchsia-300/12 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-fuchsia-100">
                    Featured
                  </span>
                ) : null}
                {poll.is_pinned ? (
                  <span className="rounded-full border border-sky-300/20 bg-sky-300/12 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-sky-100">
                    Pinned
                  </span>
                ) : null}
              </div>
              <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-white/45">
                    {poll.category?.name ?? "Uncategorized"}
                  </p>
                  <h2 className="mt-2 line-clamp-2 text-xl font-bold leading-tight text-white">
                    {poll.title}
                  </h2>
                </div>
              </div>
            </div>

            <div className="space-y-5 p-5">
              <p className="line-clamp-3 text-sm leading-6 text-white/58">
                {poll.description || "No description has been added for this poll yet."}
              </p>

              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-2xl border border-white/8 bg-white/5 px-3 py-3">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-white/38">
                    Views
                  </p>
                  <p className="mt-2 text-lg font-bold text-white">
                    {poll.view_count ?? 0}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/8 bg-white/5 px-3 py-3">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-white/38">
                    Options
                  </p>
                  <p className="mt-2 text-lg font-bold text-white">
                    {poll.options.length}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/8 bg-white/5 px-3 py-3">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-white/38">
                    Expires
                  </p>
                  <p className="mt-2 text-sm font-semibold text-white">
                    {formatDate(poll.expires_at)}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                {poll.options.slice(0, 3).map((option, index) => {
                  const safeVotes = option.vote_count ?? 0;
                  const width = Math.max(12, Math.min(100, safeVotes + 18));

                  return (
                    <div
                      key={option.id}
                      className="rounded-2xl border border-white/8 bg-white/[0.04] p-3"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="truncate text-sm font-semibold text-white/88">
                          {index + 1}. {option.label}
                        </p>
                        <span className="text-xs font-semibold text-white/45">
                          {safeVotes} votes
                        </span>
                      </div>
                      <p className="mt-1 line-clamp-2 text-xs leading-5 text-white/45">
                        {option.description}
                      </p>
                      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/8">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-sky-400 to-fuchsia-400"
                          style={{ width: `${width}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
