import type { AdminDashboardRecentActivityItem } from "@/features/admin/types";
import { createClient } from "@/utils/supabase/server";

type DashboardRecentActivityRow = {
  id: string | null;
  icon: string | null;
  text: string | null;
  sub: string | null;
  event_at: string | null;
};

export type AdminDashboardRecentActivityLoadResult = {
  items: AdminDashboardRecentActivityItem[];
};

function formatRelativeTime(value: string | null) {
  if (!value) {
    return "";
  }

  const timestamp = new Date(value);
  const diff = Date.now() - timestamp.getTime();

  if (Number.isNaN(diff) || diff < 0) {
    return "";
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

function mapRow(row: DashboardRecentActivityRow): AdminDashboardRecentActivityItem | null {
  if (!row.id || !row.text || !row.sub) {
    return null;
  }

  const icon =
    row.icon === "join" || row.icon === "vote" || row.icon === "status"
      ? row.icon
      : "status";
  const relativeTime = formatRelativeTime(row.event_at);

  return {
    id: row.id,
    icon,
    text: row.text,
    sub: relativeTime ? `${row.sub} · ${relativeTime}` : row.sub,
  };
}

export async function getAdminDashboardRecentActivity(): Promise<AdminDashboardRecentActivityLoadResult> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_admin_dashboard_recent_activity");

  if (error) {
    throw new Error(`Unable to load admin dashboard recent activity. ${error.message}`);
  }

  return {
    items: ((Array.isArray(data) ? data : []) as DashboardRecentActivityRow[])
      .map(mapRow)
      .filter((item): item is AdminDashboardRecentActivityItem => item !== null),
  };
}
