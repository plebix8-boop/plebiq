"use client";

import { startTransition, useState } from "react";
import { reorderPolls } from "@/features/admin/actions";
import type { AdminCategory, AdminPoll } from "@/features/admin/types";
import { PollEditorCard } from "./poll-editor-card";

type PollManagementBoardProps = {
  categories: AdminCategory[];
  polls: AdminPoll[];
};

export function PollManagementBoard({
  categories,
  polls,
}: PollManagementBoardProps) {
  const [orderedPolls, setOrderedPolls] = useState(polls);
  const [draggingPollId, setDraggingPollId] = useState<string | null>(null);
  const [isSavingOrder, setIsSavingOrder] = useState(false);
  const [orderMessage, setOrderMessage] = useState<string | null>(null);
  const [orderError, setOrderError] = useState<string | null>(null);

  function movePoll(draggedId: string, targetId: string) {
    if (draggedId === targetId) {
      return;
    }

    setOrderedPolls((currentPolls) => {
      const draggedIndex = currentPolls.findIndex((poll) => poll.id === draggedId);
      const targetIndex = currentPolls.findIndex((poll) => poll.id === targetId);

      if (draggedIndex === -1 || targetIndex === -1) {
        return currentPolls;
      }

      const nextPolls = [...currentPolls];
      const [draggedPoll] = nextPolls.splice(draggedIndex, 1);
      nextPolls.splice(targetIndex, 0, draggedPoll);

      return nextPolls.map((poll, index) => ({
        ...poll,
        sort_order: index,
      }));
    });
  }

  function saveOrder() {
    setIsSavingOrder(true);
    setOrderMessage(null);
    setOrderError(null);

    startTransition(async () => {
      try {
        await reorderPolls(orderedPolls.map((poll) => poll.id));
        setOrderMessage("Poll order saved.");
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
    <div className="grid gap-5">
      <div className="flex flex-col gap-3 rounded-[1.5rem] border border-white/10 bg-slate-950/35 p-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-semibold text-white">Drag to reorder polls</p>
          <p className="mt-1 text-sm text-slate-400">
            Move cards into the right sequence, then save to update `sort_order`.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {orderError ? (
            <p className="text-sm text-red-300">{orderError}</p>
          ) : null}
          {orderMessage ? (
            <p className="text-sm text-emerald-300">{orderMessage}</p>
          ) : null}
          <button
            type="button"
            onClick={saveOrder}
            disabled={isSavingOrder}
            className="inline-flex items-center justify-center rounded-2xl bg-cyan-300 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSavingOrder ? "Saving order..." : "Save poll order"}
          </button>
        </div>
      </div>

      {orderedPolls.map((poll) => (
        <div
          key={poll.id}
          draggable
          onDragStart={() => {
            setDraggingPollId(poll.id);
            setOrderMessage(null);
            setOrderError(null);
          }}
          onDragOver={(event) => {
            event.preventDefault();
          }}
          onDrop={() => {
            if (draggingPollId) {
              movePoll(draggingPollId, poll.id);
            }
            setDraggingPollId(null);
          }}
          onDragEnd={() => setDraggingPollId(null)}
          className={`transition ${
            draggingPollId === poll.id ? "opacity-60" : "opacity-100"
          }`}
        >
          <PollEditorCard
            categories={categories}
            poll={poll}
            displayOrder={orderedPolls.findIndex((item) => item.id === poll.id)}
          />
        </div>
      ))}
    </div>
  );
}
