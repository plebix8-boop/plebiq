import type {
  AdminDashboardAttentionPoll,
  AdminDashboardHealthStatus,
  AdminDashboardPollRow,
  AdminDashboardPolls,
} from "@/features/admin/types";
import { createClient } from "@/utils/supabase/server";

type DashboardPollRow = {
  poll_id: string | null;
  poll_title: string | null;
  category_name: string | null;
  poll_status: string | null;
  total_votes: number | null;
  last_vote_at: string | null;
  health: string | null;
};

const ATTENTION_TIPS: Record<AdminDashboardHealthStatus, string> = {
  "High Engagement": "Strong traction overall. Keep an eye on expiry timing and freshness.",
  "Low Engagement": "Vote activity is still very light. This poll likely needs a stronger prompt or audience.",
  "Needs Promotion": "This poll has not reached enough people yet. Consider featuring or sharing it more widely.",
  "Low Conversion": "People are opening the poll but not voting much. Review the prompt and answer clarity.",
  "Voting Slowed Down": "Vote activity has cooled off. A refresh or boost may help momentum.",
  "Very Competitive": "The race is very close. Monitor for momentum shifts before expiry.",
  "One-sided": "One option is dominating. Check whether the poll framing is balanced enough.",
};

const ATTENTION_HEALTH: AdminDashboardHealthStatus[] = [
  "Needs Promotion",
  "Low Conversion",
  "Voting Slowed Down",
  "Low Engagement",
];

export type AdminDashboardPollsLoadResult = {
  polls: AdminDashboardPolls;
};

function mapHealth(value: string | null): AdminDashboardHealthStatus {
  switch (value) {
    case "Low Engagement":
    case "Needs Promotion":
    case "Low Conversion":
    case "Voting Slowed Down":
    case "Very Competitive":
    case "One-sided":
    case "High Engagement":
      return value;
    default:
      return "High Engagement";
  }
}

function mapRow(row: DashboardPollRow): AdminDashboardPollRow | null {
  if (!row.poll_id || !row.poll_title) {
    return null;
  }

  const health = mapHealth(row.health);
  const status =
    row.poll_status === "Draft" || row.poll_status === "Closed"
      ? row.poll_status
      : "Live";

  return {
    id: row.poll_id,
    title: row.poll_title,
    category: row.category_name ?? "Uncategorized",
    status,
    votes: Number(row.total_votes ?? 0),
    lastVoteAt: row.last_vote_at,
    health,
  };
}

function buildAttention(polls: AdminDashboardPollRow[]): AdminDashboardAttentionPoll[] {
  return polls
    .filter((poll) => ATTENTION_HEALTH.includes(poll.health))
    .map((poll) => ({
      ...poll,
      tip: ATTENTION_TIPS[poll.health],
    }));
}

export async function getAdminDashboardPolls(): Promise<AdminDashboardPollsLoadResult> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_admin_dashboard_polls");

  if (error) {
    throw new Error(`Unable to load admin dashboard polls. ${error.message}`);
  }

  const performance = ((Array.isArray(data) ? data : []) as DashboardPollRow[])
    .map(mapRow)
    .filter((poll): poll is AdminDashboardPollRow => poll !== null);

  return {
    polls: {
      performance,
      attention: buildAttention(performance),
    },
  };
}
