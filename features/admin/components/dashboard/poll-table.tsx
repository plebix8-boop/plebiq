import Link from "next/link";
import type {
  AdminDashboardHealthStatus,
  AdminDashboardPollRow,
} from "@/features/admin/types";

const healthConfig: Record<
  AdminDashboardHealthStatus,
  { label: string; className: string }
> = {
  "High Engagement": {
    label: "High Engagement",
    className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  },
  "Low Engagement": {
    label: "Low Engagement",
    className: "bg-slate-500/15 text-slate-400 border-slate-500/20",
  },
  "Needs Promotion": {
    label: "Needs Promotion",
    className: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  },
  "Low Conversion": {
    label: "Low Conversion",
    className: "bg-orange-500/15 text-orange-400 border-orange-500/20",
  },
  "Voting Slowed Down": {
    label: "Voting Slowed Down",
    className: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  },
  "Very Competitive": {
    label: "Very Competitive",
    className: "bg-purple-500/15 text-purple-400 border-purple-500/20",
  },
  "One-sided": {
    label: "One-sided",
    className: "bg-rose-500/15 text-rose-400 border-rose-500/20",
  },
};

function formatLastVote(lastVoteAt: string | null) {
  if (!lastVoteAt) {
    return "No votes yet";
  }

  if (!lastVoteAt.includes("T")) {
    return lastVoteAt;
  }

  const timestamp = new Date(lastVoteAt);
  const diff = Date.now() - timestamp.getTime();

  if (Number.isNaN(diff)) {
    return "No recent vote";
  }

  const minutes = Math.floor(diff / 60000);

  if (minutes < 1) {
    return "Just now";
  }

  if (minutes < 60) {
    return `${minutes} min ago`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours} hr${hours === 1 ? "" : "s"} ago`;
  }

  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

export function PollPerformanceTable({
  polls,
}: {
  polls: AdminDashboardPollRow[];
}) {
  return (
    <div className="rounded-2xl border border-admin-card-border bg-admin-card-bg backdrop-blur-sm">
      <div className="flex items-center justify-between border-b border-admin-divider px-4 py-4 sm:px-6">
        <div>
          <h2 className="text-sm font-semibold text-admin-text">Active Poll Performance</h2>
          <p className="mt-0.5 text-xs text-admin-text-muted">{polls.length} live polls</p>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-admin-divider">
              {["Poll Title", "Category", "Status", "Votes", "Last Vote", "Health", ""].map(
                (header) => (
                  <th
                    key={header}
                    className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-admin-text-muted"
                  >
                    {header}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {polls.map((poll, index) => {
              const health = healthConfig[poll.health];

              return (
                <tr
                  key={poll.id}
                  className={`transition-colors hover:bg-admin-surface-hover ${
                    index < polls.length - 1 ? "border-b border-admin-divider" : ""
                  }`}
                >
                  <td className="max-w-[220px] px-5 py-4">
                    <p className="truncate font-medium text-admin-text">{poll.title}</p>
                  </td>
                  <td className="px-5 py-4 text-admin-text-muted">{poll.category}</td>
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-400">
                      <span className="size-1.5 rounded-full bg-emerald-400" />
                      {poll.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 font-semibold text-admin-text">
                    {poll.votes.toLocaleString()}
                  </td>
                  <td className="px-5 py-4 text-admin-text-muted">
                    {formatLastVote(poll.lastVoteAt)}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${health.className}`}
                    >
                      {health.label}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <Link
                      href={`/admin/polls/${poll.id}`}
                      className="rounded-lg border border-admin-button-secondary-border bg-admin-button-secondary-bg px-3 py-1.5 text-xs font-semibold text-admin-button-secondary-text transition hover:bg-admin-button-secondary-bg-hover"
                    >
                      View Details
                    </Link>
                  </td>
                </tr>
              );
            })}
            {polls.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-8 text-center text-sm text-admin-text-muted">
                  No live polls available yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
