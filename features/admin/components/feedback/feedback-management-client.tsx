"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AppInput, AppSelect, AppTextarea } from "@/components/form-controls";
import { updateFeedback } from "@/features/admin/actions";
import type {
  AdminActionState,
  AdminFeedbackCategory,
  AdminFeedbackRow,
  AdminFeedbackStatus,
} from "@/features/admin/types";
import {
  feedbackCategoryLabels,
  feedbackCategories,
  feedbackStatusLabels,
  feedbackStatuses,
} from "@/features/feedback/types";

const initialActionState: AdminActionState = {};

type SortKey = "created_at" | "user_email" | "category" | "status";
type SortDirection = "asc" | "desc";

type FeedbackManagementClientProps = {
  feedback: AdminFeedbackRow[];
  error?: string | null;
};

const statusOptions = [
  { value: "all", label: "All statuses" },
  ...feedbackStatuses.map((value) => ({
    value,
    label: feedbackStatusLabels[value],
  })),
];

const categoryOptions = [
  { value: "all", label: "All categories" },
  ...feedbackCategories.map((value) => ({
    value,
    label: feedbackCategoryLabels[value],
  })),
];

const chartColors = [
  "var(--chart-primary)",
  "var(--chart-secondary)",
  "var(--accent-strong)",
  "var(--accent-alt)",
  "var(--info)",
  "var(--success)",
  "var(--warning)",
  "var(--danger)",
];

const tooltipStyle = {
  backgroundColor: "var(--chart-tooltip-bg)",
  border: "1px solid var(--admin-card-border)",
  borderRadius: 12,
  color: "var(--admin-text)",
  fontSize: 12,
};

function formatDate(value: string | null) {
  if (!value) {
    return "Not set";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatAverageResponseTime(rows: AdminFeedbackRow[]) {
  const resolvedRows = rows.filter((row) => row.resolved_at);

  if (!resolvedRows.length) {
    return "No resolved feedback";
  }

  const totalMs = resolvedRows.reduce((sum, row) => {
    return (
      sum +
      (new Date(row.resolved_at!).getTime() -
        new Date(row.created_at).getTime())
    );
  }, 0);
  const avgHours = totalMs / resolvedRows.length / 1000 / 60 / 60;

  if (avgHours < 24) {
    return `${Math.max(1, Math.round(avgHours))}h`;
  }

  return `${Math.round(avgHours / 24)}d`;
}

function countBy<T extends string>(rows: AdminFeedbackRow[], key: "category" | "status") {
  const counts = new Map<T, number>();

  for (const row of rows) {
    const value = row[key] as T;
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }

  return counts;
}

function StatCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-2xl border border-admin-card-border bg-admin-card-bg p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-admin-text-muted">
        {label}
      </p>
      <p className="mt-3 text-2xl font-bold text-admin-text">{value}</p>
      <p className="mt-1 text-sm text-admin-text-subtle">{detail}</p>
    </div>
  );
}

function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-admin-card-border bg-admin-card-bg p-5">
      <h2 className="text-sm font-semibold text-admin-text">{title}</h2>
      <div className="mt-4 h-[240px]">{children}</div>
    </div>
  );
}

function SortButton({
  label,
  sortKey,
  activeKey,
  direction,
  onSort,
}: {
  label: string;
  sortKey: SortKey;
  activeKey: SortKey;
  direction: SortDirection;
  onSort: (key: SortKey) => void;
}) {
  const active = sortKey === activeKey;

  return (
    <button
      type="button"
      onClick={() => onSort(sortKey)}
      className="inline-flex items-center gap-1 text-left text-xs font-semibold uppercase tracking-[0.14em] text-admin-text-muted transition hover:text-admin-text"
    >
      {label}
      <span className={active ? "text-admin-text" : "text-admin-text-subtle"}>
        {active ? (direction === "asc" ? "↑" : "↓") : "↕"}
      </span>
    </button>
  );
}

function FeedbackRowForm({ row }: { row: AdminFeedbackRow }) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    updateFeedback,
    initialActionState,
  );
  const [status, setStatus] = useState(row.status);
  const [notes, setNotes] = useState(row.internal_notes ?? "");

  useEffect(() => {
    if (state.success) {
      router.refresh();
    }
  }, [router, state.success]);

  return (
    <form action={formAction} className="grid gap-3">
      <input type="hidden" name="feedbackId" value={row.id} />
      <div className="grid gap-3 lg:grid-cols-[190px_minmax(240px,1fr)_auto] lg:items-start">
        <AppSelect
          name="status"
          value={status}
          onChange={(value) => setStatus(value as AdminFeedbackStatus)}
          options={feedbackStatuses.map((value) => ({
            value,
            label: feedbackStatusLabels[value],
          }))}
          tone="dark"
        />
        <AppTextarea
          name="internalNotes"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="Internal notes"
          rows={2}
          tone="dark"
        />
        <div className="flex flex-wrap gap-2 lg:justify-end">
          <button
            type="submit"
            name="resolve"
            value="false"
            disabled={pending}
            className="rounded-xl border border-admin-button-secondary-border bg-admin-button-secondary-bg px-3 py-2 text-xs font-semibold text-admin-button-secondary-text transition hover:bg-admin-button-secondary-bg-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? "Saving..." : "Save"}
          </button>
          <button
            type="submit"
            name="resolve"
            value="true"
            disabled={pending}
            className="rounded-xl bg-admin-button-primary-bg px-3 py-2 text-xs font-semibold text-admin-button-primary-text transition hover:bg-admin-button-primary-bg-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            Resolve
          </button>
        </div>
      </div>
      {state.error ? (
        <p className="text-xs text-admin-danger-text">{state.error}</p>
      ) : null}
      {state.success ? (
        <p className="text-xs text-admin-success-text">{state.success}</p>
      ) : null}
    </form>
  );
}

export function FeedbackManagementClient({
  feedback,
  error,
}: FeedbackManagementClientProps) {
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("created_at");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const categoryCounts = useMemo(
    () => countBy<AdminFeedbackCategory>(feedback, "category"),
    [feedback],
  );
  const statusCounts = useMemo(
    () => countBy<AdminFeedbackStatus>(feedback, "status"),
    [feedback],
  );

  const categoryChartData = feedbackCategories.map((category) => ({
    name: feedbackCategoryLabels[category],
    value: categoryCounts.get(category) ?? 0,
  }));
  const statusChartData = feedbackStatuses.map((status) => ({
    name: feedbackStatusLabels[status],
    value: statusCounts.get(status) ?? 0,
  }));

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase();
    const fromTime = dateFrom ? new Date(`${dateFrom}T00:00:00`).getTime() : null;
    const toTime = dateTo ? new Date(`${dateTo}T23:59:59`).getTime() : null;

    return feedback
      .filter((row) => {
        if (statusFilter !== "all" && row.status !== statusFilter) {
          return false;
        }

        if (categoryFilter !== "all" && row.category !== categoryFilter) {
          return false;
        }

        const createdTime = new Date(row.created_at).getTime();
        if (fromTime && createdTime < fromTime) {
          return false;
        }

        if (toTime && createdTime > toTime) {
          return false;
        }

        if (!query) {
          return true;
        }

        return (
          row.user_email.toLowerCase().includes(query) ||
          row.message.toLowerCase().includes(query)
        );
      })
      .sort((a, b) => {
        const direction = sortDirection === "asc" ? 1 : -1;
        const aValue = a[sortKey];
        const bValue = b[sortKey];

        if (sortKey === "created_at") {
          return (
            (new Date(a.created_at).getTime() -
              new Date(b.created_at).getTime()) *
            direction
          );
        }

        return String(aValue).localeCompare(String(bValue)) * direction;
      });
  }, [
    categoryFilter,
    dateFrom,
    dateTo,
    feedback,
    search,
    sortDirection,
    sortKey,
    statusFilter,
  ]);

  function handleSort(nextKey: SortKey) {
    if (sortKey === nextKey) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }

    setSortKey(nextKey);
    setSortDirection("asc");
  }

  return (
    <div className="space-y-6">
      {error ? (
        <div className="rounded-2xl border border-admin-card-border bg-admin-card-bg px-4 py-3 text-sm text-admin-danger-text">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total feedback"
          value={String(feedback.length)}
          detail={`${filteredRows.length} visible with filters`}
        />
        <StatCard
          label="New"
          value={String(statusCounts.get("new") ?? 0)}
          detail="Awaiting first review"
        />
        <StatCard
          label="Implemented"
          value={String(statusCounts.get("implemented") ?? 0)}
          detail="Marked as shipped/resolved"
        />
        <StatCard
          label="Avg response time"
          value={formatAverageResponseTime(feedback)}
          detail="Based on resolved feedback"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <ChartCard title="Feedback by category">
          {feedback.length ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryChartData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={54}
                  outerRadius={88}
                  paddingAngle={4}
                >
                  {categoryChartData.map((entry, index) => (
                    <Cell
                      key={entry.name}
                      fill={chartColors[index % chartColors.length]}
                    />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-admin-text-muted">
              No feedback yet.
            </div>
          )}
        </ChartCard>

        <ChartCard title="Feedback by status">
          {feedback.length ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--fg-5)" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fill: "var(--chart-tick)", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  interval={0}
                />
                <YAxis
                  tick={{ fill: "var(--chart-tick)", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="value" fill="var(--chart-primary)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-admin-text-muted">
              No status data yet.
            </div>
          )}
        </ChartCard>
      </div>

      <div className="rounded-2xl border border-admin-card-border bg-admin-card-bg p-4">
        <div className="grid gap-3 lg:grid-cols-[minmax(180px,1fr)_180px_180px_150px_150px]">
          <AppInput
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search email or message"
            tone="dark"
          />
          <AppSelect
            value={statusFilter}
            onChange={setStatusFilter}
            options={statusOptions}
            tone="dark"
          />
          <AppSelect
            value={categoryFilter}
            onChange={setCategoryFilter}
            options={categoryOptions}
            tone="dark"
          />
          <AppInput
            type="date"
            value={dateFrom}
            onChange={(event) => setDateFrom(event.target.value)}
            tone="dark"
            aria-label="Date from"
          />
          <AppInput
            type="date"
            value={dateTo}
            onChange={(event) => setDateTo(event.target.value)}
            tone="dark"
            aria-label="Date to"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-admin-card-border bg-admin-card-bg">
        <div className="overflow-x-auto">
          <table className="min-w-[980px] w-full border-collapse">
            <thead className="border-b border-admin-divider bg-admin-surface">
              <tr>
                <th className="px-4 py-3 text-left">
                  <SortButton
                    label="Created"
                    sortKey="created_at"
                    activeKey={sortKey}
                    direction={sortDirection}
                    onSort={handleSort}
                  />
                </th>
                <th className="px-4 py-3 text-left">
                  <SortButton
                    label="Email"
                    sortKey="user_email"
                    activeKey={sortKey}
                    direction={sortDirection}
                    onSort={handleSort}
                  />
                </th>
                <th className="px-4 py-3 text-left">
                  <SortButton
                    label="Category"
                    sortKey="category"
                    activeKey={sortKey}
                    direction={sortDirection}
                    onSort={handleSort}
                  />
                </th>
                <th className="px-4 py-3 text-left">
                  <SortButton
                    label="Status"
                    sortKey="status"
                    activeKey={sortKey}
                    direction={sortDirection}
                    onSort={handleSort}
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.14em] text-admin-text-muted">
                  Message / Admin
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-admin-divider align-top last:border-b-0"
                >
                  <td className="px-4 py-4 text-sm text-admin-text-muted">
                    <p>{formatDate(row.created_at)}</p>
                    {row.resolved_at ? (
                      <p className="mt-2 text-xs text-admin-success-text">
                        Resolved {formatDate(row.resolved_at)}
                      </p>
                    ) : null}
                  </td>
                  <td className="px-4 py-4 text-sm font-semibold text-admin-text">
                    {row.user_email}
                  </td>
                  <td className="px-4 py-4">
                    <span className="rounded-full border border-admin-badge-info-border bg-admin-badge-info-bg px-3 py-1 text-xs font-semibold text-admin-badge-info-text">
                      {feedbackCategoryLabels[row.category]}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="rounded-full border border-admin-badge-priority-border bg-admin-badge-priority-bg px-3 py-1 text-xs font-semibold text-admin-badge-priority-text">
                      {feedbackStatusLabels[row.status]}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <p className="mb-3 max-w-2xl whitespace-pre-wrap text-sm leading-6 text-admin-text">
                      {row.message}
                    </p>
                    <FeedbackRowForm row={row} />
                  </td>
                </tr>
              ))}
              {!filteredRows.length ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-sm text-admin-text-muted">
                    No feedback matches these filters.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
