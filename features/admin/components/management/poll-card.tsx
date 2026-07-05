import type { ManagedPoll } from "./data";

const statusConfig = {
  Live:   { className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20", dot: "bg-emerald-400" },
  Draft:  { className: "bg-slate-500/15 text-slate-400 border-slate-500/20",       dot: "bg-slate-400" },
  Closed: { className: "bg-rose-500/15 text-rose-400 border-rose-500/20",           dot: "bg-rose-400" },
};

export function PollCard({ poll, onEdit }: { poll: ManagedPoll; onEdit: () => void }) {
  const status = statusConfig[poll.status];
  const conversion = poll.views > 0 ? ((poll.votes / poll.views) * 100).toFixed(1) + "%" : "—";

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-white/8 bg-white/[0.04] transition hover:border-white/15 hover:bg-white/[0.07]">
      {/* Image */}
      <div className="relative h-36 overflow-hidden">
        <img
          src={poll.image_url}
          alt={poll.title}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Badges */}
        <div className="absolute left-3 top-3 flex gap-1.5">
          <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold backdrop-blur-sm ${status.className}`}>
            <span className={`size-1.5 rounded-full ${status.dot}`} />
            {poll.status}
          </span>
          {poll.is_featured && (
            <span className="rounded-full border border-amber-400/20 bg-amber-400/15 px-2.5 py-0.5 text-xs font-semibold text-amber-400 backdrop-blur-sm">
              Featured
            </span>
          )}
          {poll.is_pinned && (
            <span className="rounded-full border border-violet-400/20 bg-violet-400/15 px-2.5 py-0.5 text-xs font-semibold text-violet-400 backdrop-blur-sm">
              Pinned
            </span>
          )}
        </div>

        {/* Category */}
        <div className="absolute bottom-3 left-3">
          <span className="rounded-full bg-black/50 px-2.5 py-0.5 text-xs font-medium text-slate-300 backdrop-blur-sm">
            {poll.category}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        <p className="line-clamp-2 text-sm font-semibold leading-snug text-white">{poll.title}</p>

        {/* Stats row */}
        <div className="flex items-center gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <svg className="size-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <polyline points="9 11 12 14 22 4" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
            {poll.votes.toLocaleString()} votes
          </span>
          <span className="flex items-center gap-1">
            <svg className="size-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            {poll.views.toLocaleString()} views
          </span>
          <span className="ml-auto font-semibold text-violet-400">{conversion}</span>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-600">
          <span>{poll.options.length} options</span>
          <span>{poll.created_at}</span>
        </div>

        {/* Actions */}
        <div className="mt-auto flex gap-2 border-t border-white/5 pt-3">
          <button
            onClick={onEdit}
            className="flex-1 rounded-lg border border-white/8 bg-white/5 py-1.5 text-xs font-semibold text-slate-300 transition hover:border-violet-500/30 hover:bg-violet-500/10 hover:text-violet-300"
          >
            Edit
          </button>
          <button className="flex-1 rounded-lg border border-white/8 bg-white/5 py-1.5 text-xs font-semibold text-slate-300 transition hover:border-white/15 hover:text-white">
            View Details
          </button>
        </div>
      </div>
    </div>
  );
}
