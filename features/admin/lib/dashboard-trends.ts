import type {
  AdminDashboardTrendPoint,
  AdminDashboardTrends,
} from "@/features/admin/types";
import { createClient } from "@/utils/supabase/server";

type DashboardTrendsRow = {
  votes_over_time: Record<string, unknown> | null;
  user_growth: Record<string, unknown> | null;
};

export type AdminDashboardTrendsLoadResult = {
  trends: AdminDashboardTrends;
};

function normalizeSeriesValue(value: unknown): AdminDashboardTrendPoint[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((point) => {
      if (!point || typeof point !== "object") {
        return null;
      }

      const date =
        typeof (point as { date?: unknown }).date === "string"
          ? (point as { date: string }).date
          : "";
      const rawValue = (point as { value?: unknown }).value;
      const numericValue =
        typeof rawValue === "number"
          ? rawValue
          : typeof rawValue === "string"
            ? Number(rawValue)
            : 0;

      if (!date) {
        return null;
      }

      return {
        date,
        value: Number.isFinite(numericValue) ? numericValue : 0,
      };
    })
    .filter((point): point is AdminDashboardTrendPoint => point !== null);
}

function mapTrendRecord(
  value: Record<string, unknown> | null,
): Record<string, AdminDashboardTrendPoint[]> {
  if (!value || typeof value !== "object") {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value).map(([key, series]) => [key, normalizeSeriesValue(series)]),
  );
}

export async function getAdminDashboardTrends(): Promise<AdminDashboardTrendsLoadResult> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_admin_dashboard_trends");

  if (error) {
    throw new Error(`Unable to load admin dashboard trends. ${error.message}`);
  }

  const row = Array.isArray(data)
    ? ((data[0] ?? null) as DashboardTrendsRow | null)
    : ((data ?? null) as DashboardTrendsRow | null);

  if (!row) {
    return {
      trends: {
        votesOverTime: {},
        userGrowth: {},
      },
    };
  }

  return {
    trends: {
      votesOverTime: mapTrendRecord(row.votes_over_time),
      userGrowth: mapTrendRecord(row.user_growth),
    },
  };
}
