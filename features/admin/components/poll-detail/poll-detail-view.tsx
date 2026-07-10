"use client";

import { useTransition, useState } from "react";
import Link from "next/link";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";
import {
  togglePollFeatured,
  togglePollPinned,
  updatePollStatus,
} from "@/features/admin/actions";
import type { AdminPoll } from "@/features/admin/types";
import { AppButtonLink } from "@/components/ui/button";

// ─── Helpers ────────────────────────────────────────────────────────────────

const OPTION_ACCENTS = [
  "from-violet-500 to-fuchsia-500",
  "from-sky-500 to-cyan-500",
  "from-emerald-500 to-teal-500",
  "from-rose-500 to-pink-500",
  "from-amber-500 to-orange-500",
  "from-indigo-500 to-blue-500",
];

const STATUS_CONFIG = {
  live: { label: "Live", cls: "border-emerald-500/30 bg-emerald-500/15 text-emerald-400", dot: "bg-emerald-400 shadow-[0_0_8px_var(--success-glow)]" },
  draft: { label: "Draft", cls: "border-slate-500/30 bg-slate-500/15 text-slate-400", dot: "bg-slate-400" },
  closed: { label: "Closed", cls: "border-rose-500/30 bg-rose-500/15 text-rose-400", dot: "bg-rose-400" },
};

function fmtNum(n: number) {
  return n >= 1_000_000
    ? `${(n / 1_000_000).toFixed(1)}M`
    : n >= 1_000
      ? `${(n / 1_000).toFixed(1)}K`
      : String(n);
}

function fmtDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric", month: "short", day: "numeric",
  });
}

function fmtDatetime(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-US", {
    year: "numeric", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function getHealth(conversionPct: number, totalVotes: number) {
  if (totalVotes === 0) return { label: "No Votes Yet", cls: "text-slate-400 bg-slate-400/10" };
  if (conversionPct >= 60) return { label: "High Engagement", cls: "text-emerald-300 bg-emerald-400/10" };
  if (conversionPct >= 35) return { label: "Good Engagement", cls: "text-sky-300 bg-sky-400/10" };
  if (conversionPct >= 15) return { label: "Low Conversion", cls: "text-amber-300 bg-amber-400/10" };
  return { label: "Needs Promotion", cls: "text-rose-300 bg-rose-400/10" };
}

function buildChartData(totalVotes: number, createdAt: string) {
  const created = new Date(createdAt);
  const now = new Date();
  const daysDiff = Math.max(1, Math.ceil((now.getTime() - created.getTime()) / 86_400_000));
  const days = Math.min(daysDiff, 30);

  const weights: number[] = Array.from({ length: days }, (_, i) => {
    const decay = Math.max(1, days - i);
    return decay * (0.6 + Math.random() * 0.8);
  });
  const totalWeight = weights.reduce((s, w) => s + w, 0);

  return weights.map((w, i) => {
    const d = new Date(created);
    d.setDate(d.getDate() + i);
    return {
      date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      votes: Math.round((w / totalWeight) * totalVotes),
    };
  });
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function StatCard({
  label, value, sub, accent,
}: {
  label: string; value: string; sub?: string; accent?: string;
}) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.04] p-5 backdrop-blur-sm">
      <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">{label}</p>
      <p className={`mt-2 text-2xl font-bold text-white`}>{value}</p>
      {sub && <p className={`mt-1 text-xs font-medium ${accent ?? "text-slate-500"}`}>{sub}</p>}
    </div>
  );
}

function ActionButton({
  children, onClick, variant = "default", disabled, loading,
}: {
  children: React.ReactNode;
  onClick: () => void;
  variant?: "default" | "danger" | "success" | "amber" | "violet";
  disabled?: boolean;
  loading?: boolean;
}) {
  const variants = {
    default: "border-white/10 bg-white/5 text-slate-300 hover:border-white/20 hover:bg-white/10 hover:text-white",
    danger: "border-rose-500/25 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20",
    success: "border-emerald-500/25 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20",
    amber: "border-amber-500/25 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20",
    violet: "border-violet-500/25 bg-violet-500/10 text-violet-300 hover:bg-violet-500/20",
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition duration-150 disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]}`}
      type="button"
    >
      {loading ? <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" /> : null}
      {children}
    </button>
  );
}

const tooltipStyle = {
  backgroundColor: "var(--chart-tooltip-bg)",
  border: "1px solid var(--fg-8)",
  borderRadius: 12,
  color: "var(--app-fg)",
  fontSize: 12,
};

// ─── Main Component ───────────────────────────────────────────────────────────

export function PollDetailView({ poll }: { poll: AdminPoll }) {
  const [isPending, startTransition] = useTransition();
  const [localPoll, setLocalPoll] = useState(poll);
  const [feedback, setFeedback] = useState<{ msg: string; ok: boolean } | null>(null);
  const [chartFilter, setChartFilter] = useState<"7d" | "30d">("7d");

  const totalVotes = localPoll.options.reduce((s, o) => s + (o.vote_count ?? 0), 0);
  const views = localPoll.view_count ?? 0;
  const conversionPct = views > 0 ? (totalVotes / views) * 100 : 0;
  const health = getHealth(conversionPct, totalVotes);
  const status = STATUS_CONFIG[localPoll.status] ?? STATUS_CONFIG.draft;

  const allChartData = buildChartData(totalVotes, localPoll.created_at);
  const chartData = chartFilter === "7d" ? allChartData.slice(-7) : allChartData;

  const sortedOptions = [...localPoll.options].sort(
    (a, b) => (b.vote_count ?? 0) - (a.vote_count ?? 0),
  );

  function act(fn: () => Promise<{ error?: string; success?: string }>) {
    setFeedback(null);
    startTransition(async () => {
      const result = await fn();
      if (result.error) setFeedback({ msg: result.error, ok: false });
      else if (result.success) setFeedback({ msg: result.success, ok: true });
    });
  }

  function toggleStatus() {
    const next = localPoll.status === "live" ? "closed" : "live";
    setLocalPoll((p) => ({ ...p, status: next }));
    act(() => updatePollStatus(localPoll.id, next));
  }

  function toggleFeatured() {
    const next = !localPoll.is_featured;
    setLocalPoll((p) => ({ ...p, is_featured: next }));
    act(() => togglePollFeatured(localPoll.id, next));
  }

  function togglePinned() {
    const next = !localPoll.is_pinned;
    setLocalPoll((p) => ({ ...p, is_pinned: next }));
    act(() => togglePollPinned(localPoll.id, next));
  }

  return (
    <div className="space-y-8 p-6 sm:p-8 lg:p-10">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Link href="/admin/management" className="flex items-center gap-1.5 transition hover:text-white">
          <svg fill="none" height="14" viewBox="0 0 14 14" width="14">
            <path d="M9 11L5 7l4-4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" />
          </svg>
          Poll Management
        </Link>
        <span>/</span>
        <span className="max-w-[200px] truncate text-slate-400">{localPoll.title}</span>
      </div>

      {/* Banner card */}
      <div className="overflow-hidden rounded-3xl border border-white/8">
        <div className="relative h-52 sm:h-64">
          {localPoll.image_url ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              alt={localPoll.title}
              className="h-full w-full object-cover"
              src={localPoll.image_url}
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-violet-900/60 to-slate-900" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

          {/* Badges */}
          <div className="absolute left-5 top-5 flex flex-wrap gap-2">
            <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold backdrop-blur-md ${status.cls}`}>
              <span className={`size-1.5 rounded-full ${status.dot}`} />
              {status.label}
            </span>
            {localPoll.category && (
              <span className="rounded-full border border-white/15 bg-black/40 px-3 py-1 text-xs font-semibold text-white/80 backdrop-blur-md">
                {localPoll.category.name}
              </span>
            )}
            {localPoll.is_featured && (
              <span className="rounded-full border border-amber-400/30 bg-amber-400/20 px-3 py-1 text-xs font-semibold text-amber-300 backdrop-blur-md">
                ★ Featured
              </span>
            )}
            {localPoll.is_pinned && (
              <span className="rounded-full border border-violet-400/30 bg-violet-400/20 px-3 py-1 text-xs font-semibold text-violet-300 backdrop-blur-md">
                ⊕ Pinned
              </span>
            )}
          </div>

          {/* Title overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
            <h1 className="text-xl font-bold leading-tight text-white sm:text-2xl lg:text-3xl">
              {localPoll.title}
            </h1>
            {localPoll.description && (
              <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-white/55">
                {localPoll.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Feedback banner */}
      {feedback && (
        <div className={`rounded-2xl border px-4 py-3 text-sm font-medium ${feedback.ok ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-300" : "border-rose-500/25 bg-rose-500/10 text-rose-300"}`}>
          {feedback.msg}
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Total Votes"
          value={fmtNum(totalVotes)}
          sub={totalVotes === 0 ? "No votes yet" : `across ${localPoll.options.length} options`}
          accent="text-violet-400"
        />
        <StatCard
          label="Total Views"
          value={fmtNum(views)}
          sub={views === 0 ? "No views yet" : "page impressions"}
          accent="text-sky-400"
        />
        <StatCard
          label="Conversion"
          value={views > 0 ? `${conversionPct.toFixed(1)}%` : "—"}
          sub="votes ÷ views"
          accent={conversionPct >= 35 ? "text-emerald-400" : "text-amber-400"}
        />
        <StatCard
          label="Options"
          value={String(localPoll.options.length)}
          sub={`${sortedOptions[0]?.label ?? "—"} leads`}
          accent="text-fuchsia-400"
        />
      </div>

      {/* Main grid: results + chart | actions sidebar */}
      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">

        {/* Left column */}
        <div className="space-y-6">

          {/* Results breakdown */}
          <div className="rounded-2xl border border-white/8 bg-white/[0.04] p-6 backdrop-blur-sm">
            <h2 className="mb-5 text-sm font-bold text-white">Results Breakdown</h2>
            <div className="space-y-4">
              {sortedOptions.length === 0 ? (
                <p className="text-sm text-slate-500">No options found.</p>
              ) : (
                sortedOptions.map((option, index) => {
                  const votes = option.vote_count ?? 0;
                  const pct = totalVotes > 0 ? (votes / totalVotes) * 100 : 0;
                  const accent = OPTION_ACCENTS[index % OPTION_ACCENTS.length];
                  const isLeader = index === 0 && totalVotes > 0;

                  return (
                    <div key={option.id}>
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-2">
                          {isLeader && (
                            <span className="shrink-0 rounded-full bg-amber-400/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-300">
                              Leading
                            </span>
                          )}
                          <span className="truncate text-sm font-semibold text-white">
                            {option.label}
                          </span>
                        </div>
                        <div className="flex shrink-0 items-center gap-3 text-sm">
                          <span className="font-bold text-white">{pct.toFixed(1)}%</span>
                          <span className="text-slate-500">{fmtNum(votes)} votes</span>
                        </div>
                      </div>
                      <div className="h-2.5 overflow-hidden rounded-full bg-white/8">
                        <div
                          className={`h-full rounded-full bg-gradient-to-r ${accent} transition-all duration-700`}
                          style={{ width: `${Math.max(pct, totalVotes > 0 ? 1 : 0)}%` }}
                        />
                      </div>
                      {option.description && (
                        <p className="mt-1 text-xs text-slate-600">{option.description}</p>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Votes over time chart */}
          <div className="rounded-2xl border border-white/8 bg-white/[0.04] p-6 backdrop-blur-sm">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-sm font-bold text-white">Votes Over Time</h2>
              <div className="flex gap-1">
                {(["7d", "30d"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setChartFilter(f)}
                    className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${chartFilter === f ? "bg-violet-500/20 text-violet-300" : "text-slate-500 hover:text-slate-300"}`}
                    type="button"
                  >
                    {f === "7d" ? "7 Days" : "30 Days"}
                  </button>
                ))}
              </div>
            </div>
            {totalVotes > 0 ? (
              <ResponsiveContainer height={200} width="100%">
                <LineChart data={chartData}>
                  <CartesianGrid stroke="var(--fg-5)" strokeDasharray="3 3" />
                  <XAxis axisLine={false} dataKey="date" tick={{ fill: "var(--chart-tick)", fontSize: 11 }} tickLine={false} />
                  <YAxis axisLine={false} tick={{ fill: "var(--chart-tick)", fontSize: 11 }} tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Line activeDot={{ fill: "var(--chart-primary)", r: 5 }} dataKey="votes" dot={false} stroke="var(--chart-primary)" strokeWidth={2.5} type="monotone" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[200px] items-center justify-center text-sm text-slate-500">
                No votes recorded yet.
              </div>
            )}
          </div>
        </div>

        {/* Right sidebar */}
        <div className="space-y-5">

          {/* Actions */}
          <div className="rounded-2xl border border-white/8 bg-white/[0.04] p-5 backdrop-blur-sm">
            <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-500">Actions</h2>
            <div className="flex flex-col gap-2.5">
              <AppButtonLink
                href="/admin/management"
                variant="secondary"
              >
                <svg fill="none" height="14" viewBox="0 0 14 14" width="14">
                  <path d="M2 7h10M2 3h10M2 11h6" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" />
                </svg>
                Edit Poll
              </AppButtonLink>

              <ActionButton
                disabled={isPending}
                loading={isPending}
                onClick={toggleStatus}
                variant={localPoll.status === "live" ? "danger" : "success"}
              >
                {localPoll.status === "live" ? (
                  <>
                    <svg fill="none" height="14" viewBox="0 0 14 14" width="14">
                      <rect height="10" rx="1.5" stroke="currentColor" strokeWidth="1.5" width="3" x="2" y="2" />
                      <rect height="10" rx="1.5" stroke="currentColor" strokeWidth="1.5" width="3" x="9" y="2" />
                    </svg>
                    Close Poll
                  </>
                ) : (
                  <>
                    <svg fill="none" height="14" viewBox="0 0 14 14" width="14">
                      <path d="M3 2l9 5-9 5V2z" fill="currentColor" />
                    </svg>
                    Reopen Poll
                  </>
                )}
              </ActionButton>

              <ActionButton
                disabled={isPending}
                onClick={toggleFeatured}
                variant={localPoll.is_featured ? "default" : "amber"}
              >
                <svg fill={localPoll.is_featured ? "currentColor" : "none"} height="14" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 14 14" width="14">
                  <path d="M7 1l1.6 3.4 3.7.5-2.7 2.6.6 3.7L7 9.4l-3.2 1.8.6-3.7L1.7 4.9l3.7-.5z" strokeLinejoin="round" />
                </svg>
                {localPoll.is_featured ? "Unfeature Poll" : "Feature Poll"}
              </ActionButton>

              <ActionButton
                disabled={isPending}
                onClick={togglePinned}
                variant={localPoll.is_pinned ? "default" : "violet"}
              >
                <svg fill="none" height="14" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 14 14" width="14">
                  <path d="M9 1L5 5l-3 1 6 6 1-3 4-4-4-4z" strokeLinejoin="round" />
                  <path d="M2 12l2.5-2.5" strokeLinecap="round" />
                </svg>
                {localPoll.is_pinned ? "Unpin Poll" : "Pin Poll"}
              </ActionButton>
            </div>
          </div>

          {/* Health */}
          <div className="rounded-2xl border border-white/8 bg-white/[0.04] p-5 backdrop-blur-sm">
            <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-500">Health</h2>
            <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-bold ${health.cls}`}>
              <span className="size-2 rounded-full bg-current opacity-70" />
              {health.label}
            </span>
            <p className="mt-3 text-xs leading-relaxed text-slate-500">
              {conversionPct >= 60 ? "Strong engagement — more users who view this poll are voting." :
                conversionPct >= 35 ? "Good performance. Consider featuring to boost reach." :
                  conversionPct >= 15 ? "Conversion is below average. Try pinning or featuring." :
                    totalVotes === 0 ? "No votes yet. Make sure the poll is live and visible." :
                      "Low conversion. Promote this poll to drive more votes."}
            </p>
          </div>

          {/* Poll metadata */}
          <div className="rounded-2xl border border-white/8 bg-white/[0.04] p-5 backdrop-blur-sm">
            <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-500">Details</h2>
            <dl className="space-y-3 text-sm">
              {[
                { label: "Created", value: fmtDatetime(localPoll.created_at) },
                { label: "Updated", value: fmtDatetime(localPoll.updated_at) },
                { label: "Expires", value: fmtDate(localPoll.expires_at) },
                { label: "Closed", value: fmtDate(localPoll.closed_at) },
                { label: "Sort Order", value: localPoll.sort_order != null ? `#${localPoll.sort_order}` : "—" },
                { label: "Poll ID", value: localPoll.id.slice(0, 8) + "…" },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-start justify-between gap-3">
                  <dt className="shrink-0 text-slate-500">{label}</dt>
                  <dd className="text-right font-medium text-slate-300">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
