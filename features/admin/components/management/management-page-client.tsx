"use client";

import { startTransition, useState } from "react";
import { AppButton, AppButtonLink } from "@/components/ui/button";
import { reorderPolls } from "@/features/admin/actions";
import {
  CategoryManagementModal,
  type ManagedCategory,
} from "@/features/admin/components/management/category-management-modal";
import { NewPollModal } from "@/features/admin/components/management/new-poll-modal";
import type { AdminCategory, AdminPoll } from "@/features/admin/types";
import { PollPreview } from "@/features/landing/components/poll-preview";
import type { FeaturedPoll } from "@/features/landing/data";

const ACCENTS = [
  "from-violet-400 to-fuchsia-400",
  "from-sky-400 to-cyan-400",
  "from-emerald-400 to-teal-400",
  "from-rose-400 to-pink-400",
  "from-amber-400 to-orange-400",
  "from-indigo-400 to-blue-400",
  "from-teal-400 to-green-400",
  "from-orange-400 to-red-400",
];

const statusFilters = ["All", "Live", "Draft", "Closed"] as const;

function formatStatus(status: AdminPoll["status"]) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function getPreviewWidth(voteCount: number, totalVotes: number, totalOptions: number) {
  if (totalVotes > 0) {
    return `${Math.max(8, Math.round((voteCount / totalVotes) * 100))}%`;
  }

  return `${Math.round(100 / Math.max(totalOptions, 1))}%`;
}

function toFeaturedPoll(poll: AdminPoll): FeaturedPoll {
  const totalVotes = poll.options.reduce(
    (sum, option) => sum + (option.vote_count ?? 0),
    0,
  );

  return {
    tag: poll.category?.name ?? "Uncategorized",
    category: formatStatus(poll.status),
    image:
      poll.image_url ||
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&q=80",
    question: poll.title,
    description: poll.description ?? "",
    options: poll.options.map((option, index) => ({
      label: option.label,
      description: option.description,
      accent: ACCENTS[index % ACCENTS.length],
      previewWidth: getPreviewWidth(
        option.vote_count ?? 0,
        totalVotes,
        poll.options.length,
      ),
    })),
  };
}

function PollCardWrapper({
  poll,
  onEdit,
}: {
  poll: AdminPoll;
  onEdit: () => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <PollPreview poll={toFeaturedPoll(poll)} variant="management" />
      <div className="flex gap-2">
        <AppButton
          onClick={onEdit}
          variant="secondary"
          size="sm"
          className="flex-1"
        >
          Edit
        </AppButton>
        <AppButtonLink
          href={`/admin/polls/${poll.id}`}
          variant="secondary"
          size="sm"
          className="flex-1"
        >
          View Details
        </AppButtonLink>
      </div>
    </div>
  );
}

type ManagementPageClientProps = {
  initialCategories: AdminCategory[];
  initialPolls: AdminPoll[];
  categoriesError?: string | null;
  pollsError?: string | null;
};

export function ManagementPageClient({
  initialCategories,
  initialPolls,
  categoriesError,
  pollsError,
}: ManagementPageClientProps) {
  const [showNew, setShowNew] = useState(false);
  const [showCategoryManagement, setShowCategoryManagement] = useState(false);
  const [editingPoll, setEditingPoll] = useState<AdminPoll | null>(null);
  const [orderedPolls, setOrderedPolls] = useState(initialPolls);
  const [categories, setCategories] = useState<ManagedCategory[]>(initialCategories);
  const [activeStatus, setActiveStatus] =
    useState<(typeof statusFilters)[number]>("All");
  const [draggingPollId, setDraggingPollId] = useState<string | null>(null);
  const [dragHandlePollId, setDragHandlePollId] = useState<string | null>(null);
  const [isSavingOrder, setIsSavingOrder] = useState(false);
  const [hasUnsavedOrder, setHasUnsavedOrder] = useState(false);
  const [orderMessage, setOrderMessage] = useState<string | null>(null);
  const [orderError, setOrderError] = useState<string | null>(null);

  const visiblePolls =
    activeStatus === "All"
      ? orderedPolls
      : orderedPolls.filter(
          (poll) => formatStatus(poll.status) === activeStatus,
        );

  function closeModal() {
    setShowNew(false);
    setEditingPoll(null);
  }

  function handleCategoryCreated(category: ManagedCategory) {
    setCategories((current) =>
      [...current, category].sort((a, b) => a.name.localeCompare(b.name)),
    );
  }

  function handleCategoryUpdated(
    previousCategory: ManagedCategory,
    nextCategory: ManagedCategory,
  ) {
    setCategories((current) =>
      current
        .map((category) =>
          category.id === previousCategory.id ? nextCategory : category,
        )
        .sort((a, b) => a.name.localeCompare(b.name)),
    );
    setOrderedPolls((currentPolls) =>
      currentPolls.map((poll) =>
        poll.category?.id === previousCategory.id
          ? { ...poll, category: nextCategory }
          : poll,
      ),
    );
  }

  function handleCategoryDeleted(category: ManagedCategory) {
    setCategories((current) => current.filter((item) => item.id !== category.id));
    setOrderedPolls((currentPolls) =>
      currentPolls.map((poll) =>
        poll.category?.id === category.id ? { ...poll, category: null } : poll,
      ),
    );
  }

  function movePoll(draggedId: string, targetId: string) {
    if (draggedId === targetId) {
      return;
    }

    setOrderMessage(null);
    setOrderError(null);
    setHasUnsavedOrder(true);
    setOrderedPolls((currentPolls) => {
      const sourcePolls =
        activeStatus === "All"
          ? [...currentPolls]
          : currentPolls.filter(
              (poll) => formatStatus(poll.status) === activeStatus,
            );
      const draggedIndex = sourcePolls.findIndex((poll) => poll.id === draggedId);
      const targetIndex = sourcePolls.findIndex((poll) => poll.id === targetId);

      if (draggedIndex === -1 || targetIndex === -1) {
        return currentPolls;
      }

      const reorderedVisiblePolls = [...sourcePolls];
      const [movedPoll] = reorderedVisiblePolls.splice(draggedIndex, 1);
      reorderedVisiblePolls.splice(targetIndex, 0, movedPoll);
      const withOrder = reorderedVisiblePolls.map((poll, index) => ({
        ...poll,
        sort_order: index,
      }));

      if (activeStatus === "All") {
        return withOrder;
      }

      let reorderedIndex = 0;

      return currentPolls.map((poll) => {
        if (formatStatus(poll.status) !== activeStatus) {
          return poll;
        }

        const nextPoll = withOrder[reorderedIndex];
        reorderedIndex += 1;
        return nextPoll;
      });
    });
  }

  function saveOrder() {
    if (!hasUnsavedOrder || isSavingOrder) {
      return;
    }

    setIsSavingOrder(true);
    setOrderMessage(null);
    setOrderError(null);

    startTransition(async () => {
      try {
        await reorderPolls(orderedPolls.map((poll) => poll.id));
        setOrderMessage("Poll order saved.");
        setHasUnsavedOrder(false);
      } catch (error) {
        setOrderError(
          error instanceof Error ? error.message : "Unable to save poll order.",
        );
      } finally {
        setIsSavingOrder(false);
      }
    });
  }

  return (
    <>
      <div className="w-full min-w-0 space-y-10 p-6 sm:p-8 lg:p-10">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-xl font-bold text-admin-text">Poll Management</h1>
            <p className="mt-0.5 text-sm text-admin-text-muted">
              {visiblePolls.length} of {orderedPolls.length} polls visible
            </p>
            <p className="mt-2 text-xs uppercase tracking-[0.16em] text-admin-text-subtle">
              Drag cards for quick ordering. Use the order input in edit for precise placement.
            </p>
          </div>

          <div className="flex flex-col gap-4 lg:items-end">
            <div className="flex flex-wrap gap-3">
              <AppButton
                onClick={() => setShowNew(true)}
              >
                + New Poll
              </AppButton>
              <AppButton
                onClick={() => setShowCategoryManagement(true)}
                variant="secondary"
              >
                Manage Categories
              </AppButton>
              <AppButton
                onClick={saveOrder}
                disabled={isSavingOrder || !hasUnsavedOrder}
                variant="secondary"
              >
                {isSavingOrder ? "Saving Order..." : "Save Order"}
              </AppButton>
            </div>

            <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {statusFilters.map((status) => (
                <button
                  key={status}
                  onClick={() => setActiveStatus(status)}
                  type="button"
                  className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
                    activeStatus === status
                      ? "bg-admin-nav-active-bg text-admin-nav-active-text"
                      : "bg-admin-button-secondary-bg text-admin-button-secondary-text hover:bg-admin-button-secondary-bg-hover"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>

            {orderError ? (
              <p className="text-sm text-admin-danger-text">{orderError}</p>
            ) : null}
            {orderMessage ? (
              <p className="text-sm text-admin-success-text">{orderMessage}</p>
            ) : null}
          </div>
        </div>

        {categoriesError ? (
          <div className="rounded-2xl border border-admin-card-border bg-admin-card-bg px-4 py-3 text-sm text-admin-danger-text">
            {categoriesError}
          </div>
        ) : null}
        {pollsError ? (
          <div className="rounded-2xl border border-admin-card-border bg-admin-card-bg px-4 py-3 text-sm text-admin-danger-text">
            {pollsError}
          </div>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visiblePolls.map((poll) => (
            <div
              key={poll.id}
              draggable={dragHandlePollId === poll.id}
              onDragStart={(event) => {
                if (dragHandlePollId !== poll.id) {
                  event.preventDefault();
                  return;
                }

                setDraggingPollId(poll.id);
              }}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => {
                if (draggingPollId) {
                  movePoll(draggingPollId, poll.id);
                }
                setDraggingPollId(null);
                setDragHandlePollId(null);
              }}
              onDragEnd={() => {
                setDraggingPollId(null);
                setDragHandlePollId(null);
              }}
              className={`transition ${
                draggingPollId === poll.id ? "scale-[0.985] opacity-60" : "opacity-100"
              }`}
            >
              <div className="mb-2 flex items-center justify-between rounded-2xl border border-admin-card-border bg-admin-card-bg px-3 py-2">
                <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-admin-text-muted">
                  Drag to reorder
                </div>
                <button
                  type="button"
                  onMouseDown={() => setDragHandlePollId(poll.id)}
                  onMouseUp={() => setDragHandlePollId(null)}
                  onMouseLeave={() => {
                    if (draggingPollId !== poll.id) {
                      setDragHandlePollId(null);
                    }
                  }}
                  onTouchStart={() => setDragHandlePollId(poll.id)}
                  onTouchEnd={() => setDragHandlePollId(null)}
                  className="cursor-grab rounded-xl border border-admin-button-secondary-border bg-admin-button-secondary-bg px-3 py-1.5 text-xs font-semibold text-admin-button-secondary-text transition hover:bg-admin-button-secondary-bg-hover active:cursor-grabbing"
                  aria-label={`Drag ${poll.title}`}
                >
                  <span className="flex items-center gap-2">
                    <svg
                      className="size-3.5 text-admin-text-muted"
                      viewBox="0 0 16 16"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <circle cx="5" cy="4" r="1.2" />
                      <circle cx="11" cy="4" r="1.2" />
                      <circle cx="5" cy="8" r="1.2" />
                      <circle cx="11" cy="8" r="1.2" />
                      <circle cx="5" cy="12" r="1.2" />
                      <circle cx="11" cy="12" r="1.2" />
                    </svg>
                    Move
                  </span>
                </button>
              </div>
              <PollCardWrapper poll={poll} onEdit={() => setEditingPoll(poll)} />
            </div>
          ))}
        </div>
      </div>

      {showCategoryManagement ? (
        <CategoryManagementModal
          categories={categories}
          onClose={() => setShowCategoryManagement(false)}
          onCategoryCreated={handleCategoryCreated}
          onCategoryUpdated={handleCategoryUpdated}
          onCategoryDeleted={handleCategoryDeleted}
        />
      ) : null}
      {showNew ? (
        <NewPollModal onClose={closeModal} categories={categories} />
      ) : null}
      {editingPoll ? (
        <NewPollModal
          onClose={closeModal}
          poll={editingPoll}
          categories={categories}
        />
      ) : null}
    </>
  );
}
