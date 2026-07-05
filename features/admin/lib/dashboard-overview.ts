import type {
  AdminDashboardOverview,
  AdminDashboardSummaryCard,
} from "@/features/admin/types";
import { createClient } from "@/utils/supabase/server";

type DashboardOverviewRow = {
  total_users: number | null;
  users_added_last_7d: number | null;
  users_added_previous_7d: number | null;
  new_users_today: number | null;
  new_users_yesterday: number | null;
  active_polls: number | null;
  closing_soon_polls: number | null;
  total_votes: number | null;
  votes_last_7d: number | null;
  votes_previous_7d: number | null;
};

export type AdminDashboardOverviewLoadResult = {
  overview: AdminDashboardOverview | null;
  cards: AdminDashboardSummaryCard[];
};

function formatInteger(value: number) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value);
}

function formatSignedPercent(value: number) {
  return `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;
}

function formatSignedInteger(value: number) {
  return `${value >= 0 ? "+" : ""}${formatInteger(value)}`;
}

function calculateChange(current: number, previous: number) {
  if (previous === 0) {
    return current === 0 ? 0 : 100;
  }

  return ((current - previous) / previous) * 100;
}

function mapOverviewRow(row: Partial<DashboardOverviewRow>): AdminDashboardOverview {
  return {
    totalUsers: Number(row.total_users ?? 0),
    usersAddedLast7d: Number(row.users_added_last_7d ?? 0),
    usersAddedPrevious7d: Number(row.users_added_previous_7d ?? 0),
    newUsersToday: Number(row.new_users_today ?? 0),
    newUsersYesterday: Number(row.new_users_yesterday ?? 0),
    activePolls: Number(row.active_polls ?? 0),
    closingSoonPolls: Number(row.closing_soon_polls ?? 0),
    totalVotes: Number(row.total_votes ?? 0),
    votesLast7d: Number(row.votes_last_7d ?? 0),
    votesPrevious7d: Number(row.votes_previous_7d ?? 0),
  };
}

export function buildAdminDashboardSummaryCards(
  overview: AdminDashboardOverview,
): AdminDashboardSummaryCard[] {
  const usersChange = calculateChange(
    overview.usersAddedLast7d,
    overview.usersAddedPrevious7d,
  );
  const votesChange = calculateChange(
    overview.votesLast7d,
    overview.votesPrevious7d,
  );
  const newUsersDelta = overview.newUsersToday - overview.newUsersYesterday;

  return [
    {
      label: "Total Users",
      value: formatInteger(overview.totalUsers),
      change: formatSignedPercent(usersChange),
      changeLabel: "vs last week",
      icon: "users",
    },
    {
      label: "New Users Today",
      value: formatInteger(overview.newUsersToday),
      change: formatSignedInteger(newUsersDelta),
      changeLabel: "vs yesterday",
      icon: "user-plus",
    },
    {
      label: "Active Polls",
      value: formatInteger(overview.activePolls),
      change:
        overview.closingSoonPolls > 0
          ? `${formatInteger(overview.closingSoonPolls)} closing soon`
          : "No urgent expiries",
      icon: "poll",
    },
    {
      label: "Total Votes",
      value: formatInteger(overview.totalVotes),
      change: formatSignedPercent(votesChange),
      changeLabel: "vs last week",
      icon: "vote",
    },
  ];
}

export async function getAdminDashboardOverview(): Promise<AdminDashboardOverviewLoadResult> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_admin_dashboard_overview");

  if (error) {
    throw new Error(`Unable to load admin dashboard overview. ${error.message}`);
  }

  const row = Array.isArray(data)
    ? ((data[0] ?? null) as DashboardOverviewRow | null)
    : ((data ?? null) as DashboardOverviewRow | null);

  if (!row) {
    const emptyOverview = mapOverviewRow({});

    return {
      overview: emptyOverview,
      cards: buildAdminDashboardSummaryCards(emptyOverview),
    };
  }

  const overview = mapOverviewRow(row);

  return {
    overview,
    cards: buildAdminDashboardSummaryCards(overview),
  };
}
