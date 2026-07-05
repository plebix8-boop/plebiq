import type {
  AdminDashboardAudience,
  AdminDashboardCountryMetric,
  AdminDashboardLoginProviderMetric,
} from "@/features/admin/types";
import { createClient } from "@/utils/supabase/server";

type DashboardAudienceRow = {
  users_by_country: unknown;
  votes_by_country: unknown;
  login_providers: unknown;
};

export type AdminDashboardAudienceLoadResult = {
  audience: AdminDashboardAudience;
};

function normalizeCountryMetrics(value: unknown): AdminDashboardCountryMetric[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (!item || typeof item !== "object") {
        return null;
      }

      const country =
        typeof (item as { country?: unknown }).country === "string"
          ? (item as { country: string }).country
          : "Unknown";
      const rawValue = (item as { value?: unknown }).value;
      const numericValue =
        typeof rawValue === "number"
          ? rawValue
          : typeof rawValue === "string"
            ? Number(rawValue)
            : 0;

      return {
        country,
        value: Number.isFinite(numericValue) ? numericValue : 0,
      };
    })
    .filter((item): item is AdminDashboardCountryMetric => item !== null);
}

function normalizeProviderMetrics(value: unknown): AdminDashboardLoginProviderMetric[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (!item || typeof item !== "object") {
        return null;
      }

      const name =
        typeof (item as { name?: unknown }).name === "string"
          ? (item as { name: string }).name
          : "Unknown";
      const rawValue = (item as { value?: unknown }).value;
      const numericValue =
        typeof rawValue === "number"
          ? rawValue
          : typeof rawValue === "string"
            ? Number(rawValue)
            : 0;
      const fill =
        typeof (item as { fill?: unknown }).fill === "string"
          ? (item as { fill: string }).fill
          : "var(--chart-primary)";

      return {
        name,
        value: Number.isFinite(numericValue) ? numericValue : 0,
        fill,
      };
    })
    .filter((item): item is AdminDashboardLoginProviderMetric => item !== null);
}

export async function getAdminDashboardAudience(): Promise<AdminDashboardAudienceLoadResult> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_admin_dashboard_audience");

  if (error) {
    throw new Error(`Unable to load admin dashboard audience. ${error.message}`);
  }

  const row = Array.isArray(data)
    ? ((data[0] ?? null) as DashboardAudienceRow | null)
    : ((data ?? null) as DashboardAudienceRow | null);

  if (!row) {
    return {
      audience: {
        usersByCountry: [],
        votesByCountry: [],
        loginProviders: [],
      },
    };
  }

  return {
    audience: {
      usersByCountry: normalizeCountryMetrics(row.users_by_country),
      votesByCountry: normalizeCountryMetrics(row.votes_by_country),
      loginProviders: normalizeProviderMetrics(row.login_providers),
    },
  };
}
