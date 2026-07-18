"use client";

import { useState } from "react";
import type {
  AdminDashboardCountryMetric,
  AdminDashboardLoginProviderMetric,
  AdminDashboardTrendPoint,
} from "@/features/admin/types";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
const tooltipStyle = {
  backgroundColor: "var(--chart-tooltip-bg)",
  border: "1px solid var(--fg-8)",
  borderRadius: 12,
  color: "var(--app-fg)",
  fontSize: 12,
};

type TrendSeriesRecord = Record<string, AdminDashboardTrendPoint[]>;

type FilterOption = { label: string; value: string };

function ChartCard({
  title,
  filters,
  activeFilter,
  onFilterChange,
  children,
}: {
  title: string;
  filters?: FilterOption[];
  activeFilter?: string;
  onFilterChange?: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-2xl border border-admin-card-border bg-admin-card-bg p-6 backdrop-blur-sm"
      style={{ containIntrinsicSize: "300px", contentVisibility: "auto" }}
    >
      <div className="mb-5 flex items-center justify-between gap-4">
        <h3 className="text-sm font-semibold text-admin-text">{title}</h3>
        {filters && (
          <div className="flex gap-1">
            {filters.map((f) => (
              <button
                key={f.value}
                onClick={() => onFilterChange?.(f.value)}
                className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
                  activeFilter === f.value
                    ? "bg-admin-nav-active-bg text-admin-nav-active-text"
                    : "text-admin-text-muted hover:text-admin-text"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}
      </div>
      {children}
    </div>
  );
}

export function VotesOverTimeChart({
  series,
}: {
  series: TrendSeriesRecord;
}) {
  const [filter, setFilter] = useState("7d");
  const data = series[filter] ?? [];
  return (
    <ChartCard
      title="Votes Over Time"
      filters={[
        { label: "Today", value: "today" },
        { label: "7 Days", value: "7d" },
        { label: "30 Days", value: "30d" },
        { label: "This Month", value: "month" },
      ]}
      activeFilter={filter}
      onFilterChange={setFilter}
    >
      {data.length > 0 ? (
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={data} style={{ outline: "none" }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--fg-5)" />
            <XAxis dataKey="date" tick={{ fill: "var(--chart-tick)", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "var(--chart-tick)", fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Line type="monotone" dataKey="value" stroke="var(--chart-primary)" strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: "var(--chart-primary)" }} />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex h-[220px] items-center justify-center text-sm text-admin-text-muted">
          No vote trend data available.
        </div>
      )}
    </ChartCard>
  );
}

export function UserGrowthChart({
  series,
}: {
  series: TrendSeriesRecord;
}) {
  const [filter, setFilter] = useState("30d");
  const data = series[filter] ?? [];
  return (
    <ChartCard
      title="User Growth"
      filters={[
        { label: "7 Days", value: "7d" },
        { label: "30 Days", value: "30d" },
        { label: "This Month", value: "month" },
        { label: "This Year", value: "year" },
      ]}
      activeFilter={filter}
      onFilterChange={setFilter}
    >
      {data.length > 0 ? (
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={data} style={{ outline: "none" }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--fg-5)" />
            <XAxis dataKey="date" tick={{ fill: "var(--chart-tick)", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "var(--chart-tick)", fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Line type="monotone" dataKey="value" stroke="var(--chart-secondary)" strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: "var(--chart-secondary)" }} />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex h-[220px] items-center justify-center text-sm text-admin-text-muted">
          No user growth data available.
        </div>
      )}
    </ChartCard>
  );
}

export function UsersByCountryChart({
  data,
}: {
  data: AdminDashboardCountryMetric[];
}) {
  return (
    <ChartCard title="Users by Country">
      {data.length > 0 ? (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} layout="vertical" style={{ outline: "none" }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--fg-5)" horizontal={false} />
            <XAxis type="number" tick={{ fill: "var(--chart-tick)", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis dataKey="country" type="category" tick={{ fill: "var(--subtle)", fontSize: 11 }} axisLine={false} tickLine={false} width={80} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="value" fill="var(--chart-primary)" radius={[0, 6, 6, 0]} style={{ outline: "none" }} />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex h-[220px] items-center justify-center text-sm text-admin-text-muted">
          No country user data available.
        </div>
      )}
    </ChartCard>
  );
}

export function VotesByCountryChart({
  data,
}: {
  data: AdminDashboardCountryMetric[];
}) {
  return (
    <ChartCard title="Votes by Country">
      {data.length > 0 ? (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} layout="vertical" style={{ outline: "none" }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--fg-5)" horizontal={false} />
            <XAxis type="number" tick={{ fill: "var(--chart-tick)", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis dataKey="country" type="category" tick={{ fill: "var(--subtle)", fontSize: 11 }} axisLine={false} tickLine={false} width={80} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="value" fill="var(--chart-secondary)" radius={[0, 6, 6, 0]} style={{ outline: "none" }} />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex h-[220px] items-center justify-center text-sm text-admin-text-muted">
          No country vote data available.
        </div>
      )}
    </ChartCard>
  );
}

export function LoginProvidersChart({
  data,
}: {
  data: AdminDashboardLoginProviderMetric[];
}) {
  return (
    <ChartCard title="Login Providers">
      <div className="flex items-center gap-6">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height={220}>
            <PieChart style={{ outline: "none" }}>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={4}
                dataKey="value"
                style={{ outline: "none" }}
              >
                {data.map((entry) => (
                  <Cell key={entry.name} fill={entry.fill} style={{ outline: "none" }} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => `${v}%`} />
              <Legend
                formatter={(value) => <span style={{ color: "var(--subtle)", fontSize: 12 }}>{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-[220px] w-full items-center justify-center text-sm text-admin-text-muted">
            No login provider data available.
          </div>
        )}
      </div>
    </ChartCard>
  );
}
