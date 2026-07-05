"use client";

import { useActionState } from "react";
import { AppInput } from "@/components/form-controls";
import { createMockUsers } from "@/features/admin/actions";
import type { MockUserSeedState } from "@/features/admin/types";

const initialState: MockUserSeedState = {};

function toDateTimeLocal(date: Date) {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function MockUserSeedingTask() {
  const [state, formAction, pending] = useActionState(createMockUsers, initialState);
  const defaultEndAt = new Date();
  const defaultStartAt = new Date(defaultEndAt.getTime() - 1000 * 60 * 60 * 24 * 30);

  return (
    <article className="rounded-[1.5rem] border border-admin-card-border bg-admin-card-bg p-5 shadow-[0_18px_50px_var(--shadow-soft)]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-admin-badge-priority-border bg-admin-badge-priority-bg px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-admin-badge-priority-text">
              High priority
            </span>
            <span className="rounded-full border border-admin-badge-info-border bg-admin-badge-info-bg px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-admin-badge-info-text">
              Active task
            </span>
          </div>

          <h2 className="mt-4 text-lg font-semibold text-admin-text">Create mock users</h2>
          <p className="mt-2 text-sm leading-6 text-admin-text-muted">
            Generate synthetic users for dashboard testing. Every created account is
            marked with mock metadata so it can be identified and removed later.
          </p>
          <div className="mt-4 rounded-2xl border border-admin-card-border bg-admin-surface p-4 text-sm text-admin-text-muted">
            <p className="font-semibold text-admin-text">Metadata added to each user</p>
            <ul className="mt-2 space-y-1">
              <li>`is_mock: true`</li>
              <li>`mock_batch_id`</li>
              <li>`mock_created_at`</li>
              <li>{'`seed_source: "admin-seeding-task"`'}</li>
            </ul>
          </div>
        </div>

        <div className="grid gap-3 text-sm sm:min-w-[240px]">
          <div className="rounded-2xl border border-admin-card-border bg-admin-surface px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.16em] text-admin-text-muted">
              Data source
            </p>
            <p className="mt-2 font-semibold text-admin-text">Supabase Auth</p>
          </div>
          <div className="rounded-2xl border border-admin-card-border bg-admin-surface px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.16em] text-admin-text-muted">
              Role assigned
            </p>
            <p className="mt-2 font-semibold text-admin-text">user</p>
          </div>
        </div>
      </div>

      <form action={formAction} className="mt-6 grid gap-4 rounded-[1.25rem] border border-admin-card-border bg-admin-surface p-4">
        <div className="grid gap-4 lg:grid-cols-[180px_minmax(0,1fr)_minmax(0,1fr)]">
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-admin-text-muted">
              User count
            </label>
            <AppInput
              name="count"
              type="number"
              min="1"
              max="1000"
              defaultValue="300"
              tone="dark"
              className="py-2.5"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-admin-text-muted">
              Start time
            </label>
            <AppInput
              name="startAt"
              type="datetime-local"
              defaultValue={toDateTimeLocal(defaultStartAt)}
              tone="dark"
              className="py-2.5"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-admin-text-muted">
              End time
            </label>
            <AppInput
              name="endAt"
              type="datetime-local"
              defaultValue={toDateTimeLocal(defaultEndAt)}
              tone="dark"
              className="py-2.5"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-admin-text-muted">
            Users are created now in Supabase Auth, but their seeded tenure is stored in
            `mock_created_at` metadata for analytics simulation.
          </p>
          <button
            type="submit"
            disabled={pending}
            className="rounded-xl bg-admin-button-primary-bg px-4 py-2.5 text-sm font-semibold text-admin-button-primary-text transition hover:bg-admin-button-primary-bg-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? "Creating users..." : "Run task"}
          </button>
        </div>

        {state.error ? (
          <p className="rounded-2xl border border-admin-card-border bg-admin-surface px-4 py-3 text-sm text-admin-danger-text">
            {state.error}
          </p>
        ) : null}

        {state.success ? (
          <div className="rounded-2xl border border-admin-card-border bg-admin-surface px-4 py-3 text-sm text-admin-success-text">
            <p className="font-semibold text-admin-text">{state.success}</p>
            <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              <p>
                <span className="text-admin-success-label-text">Batch:</span> {state.batchId}
              </p>
              <p>
                <span className="text-admin-success-label-text">Created:</span> {state.createdCount}
              </p>
              <p>
                <span className="text-admin-success-label-text">Failed:</span> {state.failedCount}
              </p>
              <p>
                <span className="text-admin-success-label-text">Range:</span>{" "}
                {state.startAt?.slice(0, 10)} to {state.endAt?.slice(0, 10)}
              </p>
            </div>
          </div>
        ) : null}
      </form>
    </article>
  );
}
