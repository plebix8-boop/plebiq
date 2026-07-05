"use client";

import { useActionState } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { deleteVoteCampaign } from "@/features/admin/actions";
import type { AdminActionState, VoteCampaignSummary } from "@/features/admin/types";

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

function CampaignDeleteButton({ campaignId }: { campaignId: string }) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    deleteVoteCampaign,
    initialState,
  );

  useEffect(() => {
    if (state.success) {
      router.refresh();
    }
  }, [router, state.success]);

  return (
    <form action={formAction} className="space-y-2">
      <input type="hidden" name="campaignId" value={campaignId} />
      <button
        type="submit"
        disabled={pending}
        className="rounded-xl border border-admin-card-border bg-admin-surface px-3 py-2 text-xs font-semibold text-admin-danger-text transition hover:bg-admin-surface-hover disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Deleting..." : "Delete campaign"}
      </button>
      {state.error ? <p className="text-xs text-admin-danger-text">{state.error}</p> : null}
      {state.success ? (
        <p className="text-xs text-admin-success-text">{state.success}</p>
      ) : null}
    </form>
  );
}

export function VoteCampaignList({
  campaigns,
}: {
  campaigns: VoteCampaignSummary[];
}) {
  if (!campaigns.length) {
    return (
      <section className="rounded-[1.5rem] border border-admin-card-border bg-admin-card-bg p-5 shadow-[0_18px_50px_var(--shadow-soft)]">
        <h2 className="text-lg font-semibold text-admin-text">Vote campaigns</h2>
        <p className="mt-2 text-sm text-admin-text-muted">
          No mock vote campaigns have been created yet.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-[1.5rem] border border-admin-card-border bg-admin-card-bg p-5 shadow-[0_18px_50px_var(--shadow-soft)]">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-admin-text">Vote campaigns</h2>
          <p className="mt-1 text-sm text-admin-text-muted">
            Review mock vote campaigns created in the real `votes` table and remove
            them safely when you no longer need them.
          </p>
        </div>
        <span className="rounded-full border border-admin-card-border bg-admin-surface px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-admin-text-muted">
          {campaigns.length} campaigns
        </span>
      </div>

      <div className="mt-5 grid gap-4">
        {campaigns.map((campaign) => (
          <article
            key={campaign.campaignId}
            className="rounded-[1.25rem] border border-admin-card-border bg-admin-surface p-4"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0 flex-1">
                <p className="font-mono text-sm text-admin-nav-active-text">{campaign.campaignId}</p>
                <p className="mt-2 text-base font-semibold text-admin-text">
                  {campaign.pollTitle}
                </p>

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-admin-card-border bg-admin-card-bg px-4 py-3">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-admin-text-muted">
                      Total votes
                    </p>
                    <p className="mt-2 font-semibold text-admin-text">{campaign.totalVotes}</p>
                  </div>
                  <div className="rounded-2xl border border-admin-card-border bg-admin-card-bg px-4 py-3">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-admin-text-muted">
                      Start
                    </p>
                    <p className="mt-2 text-sm font-semibold text-admin-text">
                      {formatDate(campaign.createdAtStart)}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-admin-card-border bg-admin-card-bg px-4 py-3">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-admin-text-muted">
                      End
                    </p>
                    <p className="mt-2 text-sm font-semibold text-admin-text">
                      {formatDate(campaign.createdAtEnd)}
                    </p>
                  </div>
                </div>

                <div className="mt-4 rounded-2xl border border-admin-card-border bg-admin-card-bg p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-admin-text-muted">
                    Option breakdown
                  </p>
                  <div className="mt-3 grid gap-2">
                    {campaign.optionBreakdown.map((option) => (
                      <div
                        key={option.optionId}
                        className="flex items-center justify-between rounded-xl border border-admin-card-border bg-admin-surface px-3 py-2"
                      >
                        <span className="text-sm text-admin-text">{option.label}</span>
                        <span className="text-sm font-semibold text-admin-text">{option.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <CampaignDeleteButton campaignId={campaign.campaignId} />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
