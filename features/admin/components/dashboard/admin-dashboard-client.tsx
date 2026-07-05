"use client";

import { useEffect, useState } from "react";
import type {
  AdminDashboardAudience,
  AdminDashboardPolls,
  AdminDashboardRecentActivityItem,
  AdminDashboardSummaryCard,
  AdminDashboardTrends,
} from "@/features/admin/types";
import {
  LoginProvidersChart,
  UserGrowthChart,
  UsersByCountryChart,
  VotesByCountryChart,
  VotesOverTimeChart,
} from "./charts";
import { PollPerformanceTable } from "./poll-table";
import { PollsNeedingAttention, RecentActivity } from "./recent-activity";
import { SummaryCards } from "./summary-cards";

type DashboardApiState = {
  cards: AdminDashboardSummaryCard[];
  audience: AdminDashboardAudience;
  polls: AdminDashboardPolls;
  recentActivity: AdminDashboardRecentActivityItem[];
  trends: AdminDashboardTrends;
};

function createEmptyDashboardState(): DashboardApiState {
  return {
    cards: [],
    audience: {
      usersByCountry: [],
      votesByCountry: [],
      loginProviders: [],
    },
    polls: {
      performance: [],
      attention: [],
    },
    recentActivity: [],
    trends: {
      votesOverTime: {},
      userGrowth: {},
    },
  };
}

function ShimmerBlock({ className }: { className: string }) {
  return (
    <div
      className={`animate-shimmer rounded-xl bg-[linear-gradient(110deg,var(--fg-5)_8%,var(--fg-14)_18%,var(--fg-5)_33%)] bg-[length:200%_100%] ${className}`}
    />
  );
}

function LoadingCard({ label }: { label: string }) {
  return (
    <div className="rounded-2xl border border-admin-card-border bg-admin-card-bg p-5 backdrop-blur-sm">
      <ShimmerBlock className="mb-3 h-3 w-24" />
      <ShimmerBlock className="h-8 w-20" />
      <p className="mt-2 text-xs text-admin-text-muted">{label}</p>
    </div>
  );
}

function LoadingPanel({
  title,
  heightClassName,
}: {
  title: string;
  heightClassName: string;
}) {
  return (
    <div className="rounded-2xl border border-admin-card-border bg-admin-card-bg p-6 backdrop-blur-sm">
      <div className="mb-5 flex items-center justify-between gap-4">
        <ShimmerBlock className="h-4 w-32" />
        <div className="flex gap-2">
          <ShimmerBlock className="h-8 w-16 rounded-lg" />
          <ShimmerBlock className="h-8 w-16 rounded-lg" />
        </div>
      </div>
      <ShimmerBlock className={heightClassName} />
      <p className="mt-3 text-xs text-admin-text-muted">{title}</p>
    </div>
  );
}

function LoadingTable() {
  return (
    <div className="rounded-2xl border border-admin-card-border bg-admin-card-bg backdrop-blur-sm">
      <div className="border-b border-admin-divider px-6 py-4">
        <ShimmerBlock className="h-4 w-40" />
        <div className="mt-2">
          <ShimmerBlock className="h-3 w-24" />
        </div>
      </div>
      <div className="space-y-3 px-6 py-4">
        <ShimmerBlock className="h-10 w-full rounded-lg" />
        <ShimmerBlock className="h-10 w-full rounded-lg" />
        <ShimmerBlock className="h-10 w-full rounded-lg" />
        <ShimmerBlock className="h-10 w-full rounded-lg" />
        <ShimmerBlock className="h-10 w-full rounded-lg" />
      </div>
    </div>
  );
}

function LoadingList({ title }: { title: string }) {
  return (
    <div className="rounded-2xl border border-admin-card-border bg-admin-card-bg backdrop-blur-sm">
      <div className="border-b border-admin-divider px-6 py-4">
        <ShimmerBlock className="h-4 w-36" />
        <div className="mt-2">
          <ShimmerBlock className="h-3 w-28" />
        </div>
      </div>
      <div className="space-y-4 px-6 py-4">
        <ShimmerBlock className="h-12 w-full rounded-lg" />
        <ShimmerBlock className="h-12 w-full rounded-lg" />
        <ShimmerBlock className="h-12 w-full rounded-lg" />
        <p className="text-xs text-admin-text-muted">{title}</p>
      </div>
    </div>
  );
}

async function fetchDashboardJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    credentials: "same-origin",
    cache: "no-store",
  });

  if (!response.ok) {
    let message = `Request failed with ${response.status}`;

    try {
      const payload = (await response.json()) as { error?: string };
      if (payload?.error) {
        message = payload.error;
      }
    } catch {
      // Keep generic message when the body is not JSON.
    }

    throw new Error(message);
  }

  return (await response.json()) as T;
}

export function AdminDashboardClient() {
  const [data, setData] = useState<DashboardApiState>(createEmptyDashboardState);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      try {
        setLoading(true);
        setError(null);

        const [overview, trends, audience, polls, recentActivity] = await Promise.all([
          fetchDashboardJson<{ cards: AdminDashboardSummaryCard[] }>(
            "/api/admin/dashboard/overview",
          ),
          fetchDashboardJson<{ trends: AdminDashboardTrends }>(
            "/api/admin/dashboard/trends",
          ),
          fetchDashboardJson<{ audience: AdminDashboardAudience }>(
            "/api/admin/dashboard/audience",
          ),
          fetchDashboardJson<{ polls: AdminDashboardPolls }>(
            "/api/admin/dashboard/polls",
          ),
          fetchDashboardJson<{ items: AdminDashboardRecentActivityItem[] }>(
            "/api/admin/dashboard/recent-activity",
          ),
        ]);

        if (cancelled) {
          return;
        }

        setData({
          cards: overview.cards,
          trends: trends.trends,
          audience: audience.audience,
          polls: polls.polls,
          recentActivity: recentActivity.items,
        });
      } catch (loadError) {
        if (cancelled) {
          return;
        }

        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load dashboard data.",
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-6">
      {error ? (
        <div className="rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
          {error}
        </div>
      ) : null}

      {loading ? (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
            {[
              "Loading users",
              "Loading growth",
              "Loading polls",
              "Loading votes",
            ].map((label) => (
              <LoadingCard key={label} label={label} />
            ))}
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <LoadingPanel title="Loading vote trends" heightClassName="h-[220px] w-full" />
            <LoadingPanel title="Loading user growth" heightClassName="h-[220px] w-full" />
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <LoadingPanel title="Loading country users" heightClassName="h-[220px] w-full" />
            <LoadingPanel title="Loading country votes" heightClassName="h-[220px] w-full" />
            <LoadingPanel title="Loading providers" heightClassName="h-[220px] w-full" />
          </div>

          <LoadingTable />

          <div className="grid gap-4 lg:grid-cols-2">
            <LoadingList title="Loading attention data" />
            <LoadingList title="Loading recent events" />
          </div>
        </>
      ) : (
        <>
          <SummaryCards cards={data.cards} />

          <div className="grid gap-4 lg:grid-cols-2">
            <VotesOverTimeChart series={data.trends.votesOverTime} />
            <UserGrowthChart series={data.trends.userGrowth} />
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <UsersByCountryChart data={data.audience.usersByCountry} />
            <VotesByCountryChart data={data.audience.votesByCountry} />
            <LoginProvidersChart data={data.audience.loginProviders} />
          </div>

          <PollPerformanceTable polls={data.polls.performance} />

          <div className="grid gap-4 lg:grid-cols-2">
            <PollsNeedingAttention polls={data.polls.attention} />
            <RecentActivity items={data.recentActivity} />
          </div>
        </>
      )}
    </div>
  );
}
