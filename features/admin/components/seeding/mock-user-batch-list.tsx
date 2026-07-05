"use client";

import { useActionState } from "react";
import { deleteMockUserBatch } from "@/features/admin/actions";
import type { AdminActionState, MockUserBatchSummary } from "@/features/admin/types";

const initialState: AdminActionState = {};

function formatDate(value: string | null) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function BatchDeleteButton({ batchId }: { batchId: string }) {
  const [state, formAction, pending] = useActionState(
    deleteMockUserBatch,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-2">
      <input type="hidden" name="batchId" value={batchId} />
      <button
        type="submit"
        disabled={pending}
        className="rounded-xl border border-admin-card-border bg-admin-surface px-3 py-2 text-xs font-semibold text-admin-danger-text transition hover:bg-admin-surface-hover disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Deleting..." : "Delete batch"}
      </button>
      {state.error ? (
        <p className="text-xs text-admin-danger-text">{state.error}</p>
      ) : null}
      {state.success ? (
        <p className="text-xs text-admin-success-text">{state.success}</p>
      ) : null}
    </form>
  );
}

export function MockUserBatchList({
  batches,
}: {
  batches: MockUserBatchSummary[];
}) {
  if (!batches.length) {
    return (
      <section className="rounded-[1.5rem] border border-admin-card-border bg-admin-card-bg p-5 shadow-[0_18px_50px_var(--shadow-soft)]">
        <h2 className="text-lg font-semibold text-admin-text">Mock batches</h2>
        <p className="mt-2 text-sm text-admin-text-muted">
          No mock user batches have been created yet.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-[1.5rem] border border-admin-card-border bg-admin-card-bg p-5 shadow-[0_18px_50px_var(--shadow-soft)]">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-admin-text">Mock batches</h2>
          <p className="mt-1 text-sm text-admin-text-muted">
            Review seeded user batches and remove them directly from admin when
            they are no longer needed.
          </p>
        </div>
        <span className="rounded-full border border-admin-card-border bg-admin-surface px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-admin-text-muted">
          {batches.length} batches
        </span>
      </div>

      <div className="mt-5 grid gap-4">
        {batches.map((batch) => (
          <article
            key={batch.batchId}
            className="rounded-[1.25rem] border border-admin-card-border bg-admin-surface p-4"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0 flex-1">
                <p className="font-mono text-sm text-admin-nav-active-text">{batch.batchId}</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-admin-card-border bg-admin-card-bg px-4 py-3">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-admin-text-muted">
                      Users
                    </p>
                    <p className="mt-2 font-semibold text-admin-text">{batch.userCount}</p>
                  </div>
                  <div className="rounded-2xl border border-admin-card-border bg-admin-card-bg px-4 py-3">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-admin-text-muted">
                      Seeded range
                    </p>
                    <p className="mt-2 text-sm font-semibold text-admin-text">
                      {formatDate(batch.seededStartAt)}
                    </p>
                    <p className="mt-1 text-xs text-admin-text-muted">
                      to {formatDate(batch.seededEndAt)}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-admin-card-border bg-admin-card-bg px-4 py-3">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-admin-text-muted">
                      Created batch
                    </p>
                    <p className="mt-2 text-sm font-semibold text-admin-text">
                      {formatDate(batch.batchCreatedAt)}
                    </p>
                  </div>
                </div>
              </div>

              <BatchDeleteButton batchId={batch.batchId} />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
