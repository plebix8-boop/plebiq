"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AppInput } from "@/components/form-controls";
import { AppButton } from "@/components/ui/button";
import { changeUserRole } from "@/features/admin/actions";
import type { AdminUserRecord } from "@/features/admin/types";

type PendingChange = {
  user: AdminUserRecord;
  nextRole: "admin" | "user";
};

function formatDate(value: string | null) {
  if (!value) return "Never";
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export function UserManagementClient({
  currentUserId,
  users,
}: {
  currentUserId: string;
  users: AdminUserRecord[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "user">("all");
  const [pendingChange, setPendingChange] = useState<PendingChange | null>(null);
  const [feedback, setFeedback] = useState<{ error?: string; success?: string }>({});

  const visibleUsers = useMemo(() => {
    const query = search.trim().toLowerCase();
    return users.filter((user) => {
      if (roleFilter !== "all" && user.role !== roleFilter) return false;
      if (!query) return true;
      return [user.email, user.name ?? "", user.country ?? "", user.provider]
        .some((value) => value.toLowerCase().includes(query));
    });
  }, [roleFilter, search, users]);

  const adminCount = users.filter((user) => user.role === "admin").length;

  function confirmRoleChange() {
    if (!pendingChange) return;
    const { nextRole, user } = pendingChange;
    setFeedback({});

    startTransition(async () => {
      const result = await changeUserRole(user.id, nextRole);
      setFeedback(result);
      if (result.success) {
        setPendingChange(null);
        router.refresh();
      }
    });
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Total users", value: users.length },
          { label: "Administrators", value: adminCount },
          { label: "Normal users", value: users.length - adminCount },
        ].map((item) => (
          <div className="rounded-2xl border border-admin-card-border bg-admin-card-bg p-5" key={item.label}>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-admin-text-muted">{item.label}</p>
            <p className="mt-2 text-2xl font-bold text-admin-text">{item.value}</p>
          </div>
        ))}
      </div>

      {feedback.error ? (
        <div className="rounded-2xl border border-admin-danger-text/50 bg-danger-soft px-4 py-3 text-sm font-semibold text-admin-danger-text" role="alert">
          {feedback.error}
        </div>
      ) : null}
      {feedback.success ? (
        <div className="rounded-2xl border border-admin-card-border-hover bg-success-soft px-4 py-3 text-sm font-semibold text-admin-success-text" role="status">
          {feedback.success}
        </div>
      ) : null}

      <div className="rounded-2xl border border-admin-card-border bg-admin-card-bg p-4">
        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
          <AppInput
            aria-label="Search users"
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by email, name, country, or provider"
            tone="light"
            value={search}
          />
          <div className="flex gap-2 overflow-x-auto">
            {(["all", "admin", "user"] as const).map((role) => (
              <button
                className={`shrink-0 rounded-xl px-4 py-2 text-sm font-semibold capitalize transition ${roleFilter === role ? "bg-admin-nav-active-bg text-admin-nav-active-text" : "bg-admin-button-secondary-bg text-admin-button-secondary-text hover:bg-admin-button-secondary-bg-hover"}`}
                key={role}
                onClick={() => setRoleFilter(role)}
                type="button"
              >
                {role === "all" ? "All roles" : role}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-3">
        {visibleUsers.map((user) => {
          const isCurrentUser = user.id === currentUserId;
          return (
            <article className="rounded-2xl border border-admin-card-border bg-admin-card-bg p-4 sm:p-5" key={user.id}>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="truncate text-sm font-bold text-admin-text">{user.name ?? user.email}</h2>
                    <span className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${user.role === "admin" ? "border-admin-badge-priority-border bg-admin-badge-priority-bg text-admin-badge-priority-text" : "border-admin-card-border bg-admin-surface text-admin-text-muted"}`}>
                      {user.role}
                    </span>
                    {isCurrentUser ? <span className="text-xs font-semibold text-admin-nav-active-text">You</span> : null}
                  </div>
                  {user.name ? <p className="mt-1 truncate text-sm text-admin-text-muted">{user.email}</p> : null}
                  <p className="mt-2 text-xs text-admin-text-subtle">
                    {user.provider} · {user.country ?? "Country unknown"} · Joined {formatDate(user.createdAt)} · Last active {formatDate(user.lastSignInAt)}
                  </p>
                </div>
                <AppButton
                  className="sm:shrink-0"
                  disabled={isPending || (isCurrentUser && user.role === "admin")}
                  onClick={() => setPendingChange({ user, nextRole: user.role === "admin" ? "user" : "admin" })}
                  size="sm"
                  variant={user.role === "admin" ? "secondary" : "primary"}
                >
                  {user.role === "admin" ? "Remove admin" : "Make admin"}
                </AppButton>
              </div>
            </article>
          );
        })}

        {!visibleUsers.length ? (
          <div className="rounded-2xl border border-admin-card-border bg-admin-surface px-4 py-12 text-center text-sm text-admin-text-muted">
            No users match your search.
          </div>
        ) : null}
      </div>

      {pendingChange ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={() => !isPending && setPendingChange(null)}>
          <div className="w-full max-w-md rounded-2xl border border-admin-card-border bg-admin-card-bg p-6 shadow-[0_24px_80px_var(--shadow-soft)]" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="role-change-title">
            <div className={`grid size-11 place-items-center rounded-full ${pendingChange.nextRole === "admin" ? "bg-admin-nav-active-bg text-admin-nav-active-text" : "bg-danger-soft text-admin-danger-text"}`}>
              <span className="text-lg font-black">!</span>
            </div>
            <h2 className="mt-4 text-lg font-bold text-admin-text" id="role-change-title">
              {pendingChange.nextRole === "admin" ? "Grant admin access?" : "Remove admin access?"}
            </h2>
            <p className="mt-2 text-sm leading-6 text-admin-text-muted">
              {pendingChange.nextRole === "admin"
                ? `${pendingChange.user.email} will be able to manage polls, users, feedback, and administrative tools.`
                : `${pendingChange.user.email} will lose access to all administrative screens and actions.`}
            </p>
            <p className="mt-3 rounded-xl bg-admin-surface px-3 py-2 text-xs text-admin-text-muted">
              The user must refresh their session or sign in again for the new role to take effect.
            </p>
            {feedback.error ? <p className="mt-3 text-sm font-semibold text-admin-danger-text">{feedback.error}</p> : null}
            <div className="mt-6 flex justify-end gap-3">
              <AppButton disabled={isPending} onClick={() => setPendingChange(null)} variant="secondary">Cancel</AppButton>
              <AppButton disabled={isPending} onClick={confirmRoleChange}>
                {isPending ? "Updating..." : pendingChange.nextRole === "admin" ? "Grant access" : "Remove access"}
              </AppButton>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
