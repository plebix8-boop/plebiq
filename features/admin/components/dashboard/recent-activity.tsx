import Link from "next/link";
import type {
  AdminDashboardAttentionPoll,
  AdminDashboardHealthStatus,
  AdminDashboardRecentActivityItem,
} from "@/features/admin/types";

const attentionConfig: Record<
  AdminDashboardHealthStatus,
  { label: string; tip: string; className: string }
> = {
  "Needs Promotion": {
    label: "Needs Promotion",
    tip: "This poll has not built enough momentum yet. Consider featuring or sharing it more aggressively.",
    className: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  },
  "Low Conversion": {
    label: "Low Conversion",
    tip: "Voters are not engaging as expected. The prompt or answer choices may need refinement.",
    className: "bg-orange-500/15 text-orange-400 border-orange-500/20",
  },
  "Voting Slowed Down": {
    label: "Voting Slowed Down",
    tip: "Recent vote activity has slowed down noticeably.",
    className: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  },
  "Low Engagement": {
    label: "Low Engagement",
    tip: "Overall vote activity is low. This poll needs review.",
    className: "bg-slate-500/15 text-slate-400 border-slate-500/20",
  },
  "High Engagement": {
    label: "High Engagement",
    tip: "Strong performance overall.",
    className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  },
  "Very Competitive": {
    label: "Very Competitive",
    tip: "The result is currently very close.",
    className: "bg-purple-500/15 text-purple-400 border-purple-500/20",
  },
  "One-sided": {
    label: "One-sided",
    tip: "One option is dominating the result.",
    className: "bg-rose-500/15 text-rose-400 border-rose-500/20",
  },
};

const activityIcons: Record<string, React.ReactNode> = {
  join: (
    <svg className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <line x1="19" y1="8" x2="19" y2="14" />
      <line x1="16" y1="11" x2="22" y2="11" />
    </svg>
  ),
  vote: (
    <svg className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      <polyline points="9 11 12 14 22 4" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  ),
  status: (
    <svg className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
};

const iconBg: Record<string, string> = {
  join: "bg-emerald-500/15 text-emerald-400",
  vote: "bg-violet-500/15 text-violet-400",
  status: "bg-blue-500/15 text-blue-400",
};

export function PollsNeedingAttention({
  polls,
}: {
  polls: AdminDashboardAttentionPoll[];
}) {
  return (
    <div className="min-w-0 rounded-2xl border border-admin-card-border bg-admin-card-bg backdrop-blur-sm">
      <div className="border-b border-admin-divider px-4 py-4 sm:px-6">
        <h3 className="text-sm font-semibold text-admin-text">Polls Needing Attention</h3>
        <p className="mt-0.5 text-xs text-admin-text-muted">{polls.length} polls require review</p>
      </div>
      <div className="divide-y divide-admin-divider">
        {polls.map((poll) => {
          const cfg = attentionConfig[poll.health];

          return (
            <div key={poll.id} className="min-w-0 flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-start sm:justify-between sm:gap-4 sm:px-6">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-admin-text">{poll.title}</p>
                <p className="mt-0.5 text-xs text-admin-text-muted">{poll.tip || cfg.tip}</p>
              </div>
              <div className="flex flex-row items-center gap-3 sm:flex-col sm:items-end sm:gap-2 sm:shrink-0">
                <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${cfg.className}`}>
                  {cfg.label}
                </span>
                <Link href={`/admin/polls/${poll.id}`} className="text-xs text-violet-400 hover:text-violet-300">View Details →</Link>
              </div>
            </div>
          );
        })}
        {polls.length === 0 ? (
          <div className="px-4 py-8 text-sm text-admin-text-muted sm:px-6">
            No live polls need attention right now.
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function RecentActivity({
  items,
}: {
  items: AdminDashboardRecentActivityItem[];
}) {
  return (
    <div className="min-w-0 rounded-2xl border border-admin-card-border bg-admin-card-bg backdrop-blur-sm">
      <div className="border-b border-admin-divider px-4 py-4 sm:px-6">
        <h3 className="text-sm font-semibold text-admin-text">Recent Activity</h3>
        <p className="mt-0.5 text-xs text-admin-text-muted">Latest platform events</p>
      </div>
      <div className="divide-y divide-admin-divider">
        {items.map((item) => (
          <div key={item.id} className="min-w-0 flex items-start gap-3 px-4 py-3 sm:px-6 sm:py-3.5">
            <div className={`mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full ${iconBg[item.icon]}`}>
              {activityIcons[item.icon]}
            </div>
            <div className="min-w-0">
              <p className="text-sm text-admin-text">{item.text}</p>
              <p className="mt-0.5 text-xs text-admin-text-muted">{item.sub}</p>
            </div>
          </div>
        ))}
        {items.length === 0 ? (
          <div className="px-4 py-8 text-sm text-admin-text-muted sm:px-6">
            No recent activity available yet.
          </div>
        ) : null}
      </div>
    </div>
  );
}
