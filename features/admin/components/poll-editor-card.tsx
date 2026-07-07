"use client";

import { useActionState, useState } from "react";
import { AppInput, AppTextarea } from "@/components/form-controls";
import { AppButton } from "@/components/ui/button";
import { updatePoll } from "@/features/admin/actions";
import { AdminSelect } from "@/features/admin/components/ui/admin-select";
import type {
  AdminActionState,
  AdminCategory,
  AdminPoll,
  AdminPollOption,
} from "@/features/admin/types";

const initialState: AdminActionState = {};

type PollEditorCardProps = {
  categories: AdminCategory[];
  poll: AdminPoll;
  displayOrder: number;
};

type EditableOption = AdminPollOption & {
  tempId: string;
};

function createTempId() {
  return Math.random().toString(36).slice(2, 11);
}

export function PollEditorCard({
  categories,
  poll,
  displayOrder,
}: PollEditorCardProps) {
  const [state, formAction] = useActionState(updatePoll, initialState);
  const [options, setOptions] = useState<EditableOption[]>(
    poll.options.map((option, index) => ({
      ...option,
      sort_order: option.sort_order ?? index,
      tempId: option.id,
    })),
  );
  const [categoryId, setCategoryId] = useState(poll.category?.id ?? "");
  const [status, setStatus] = useState(poll.status);
  const [draggingOptionId, setDraggingOptionId] = useState<string | null>(null);

  const serializedOptions = JSON.stringify(
    options.map((option, index) => ({
      id: option.id,
      label: option.label,
      description: option.description,
      sort_order: index,
      vote_count: option.vote_count,
    })),
  );

  function moveOption(draggedId: string, targetId: string) {
    if (draggedId === targetId) {
      return;
    }

    setOptions((currentOptions) => {
      const draggedIndex = currentOptions.findIndex(
        (option) => option.tempId === draggedId,
      );
      const targetIndex = currentOptions.findIndex(
        (option) => option.tempId === targetId,
      );

      if (draggedIndex === -1 || targetIndex === -1) {
        return currentOptions;
      }

      const nextOptions = [...currentOptions];
      const [draggedOption] = nextOptions.splice(draggedIndex, 1);
      nextOptions.splice(targetIndex, 0, draggedOption);

      return nextOptions.map((option, index) => ({
        ...option,
        sort_order: index,
      }));
    });
  }

  function updateOptionField(
    tempId: string,
    field: "label" | "description",
    value: string,
  ) {
    setOptions((currentOptions) =>
      currentOptions.map((option) =>
        option.tempId === tempId ? { ...option, [field]: value } : option,
      ),
    );
  }

  function addOption() {
    setOptions((currentOptions) => [
      ...currentOptions,
      {
        id: `new-${createTempId()}`,
        tempId: createTempId(),
        label: "",
        description: "",
        sort_order: currentOptions.length,
        vote_count: 0,
      },
    ]);
  }

  function removeOption(tempId: string) {
    setOptions((currentOptions) =>
      currentOptions
        .filter((option) => option.tempId !== tempId)
        .map((option, index) => ({
          ...option,
          sort_order: index,
        })),
    );
  }

  return (
    <article className="rounded-[1.5rem] border border-white/10 bg-slate-950/35 p-5">
      <form action={formAction} className="flex flex-col gap-5">
        <input name="pollId" type="hidden" value={poll.id} />
        <input name="optionsJson" type="hidden" value={serializedOptions} />

        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">
                {poll.status}
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
                Order {displayOrder + 1}
              </span>
              {poll.is_featured ? (
                <span className="rounded-full border border-fuchsia-300/20 bg-fuchsia-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-fuchsia-200">
                  Featured
                </span>
              ) : null}
              {poll.is_pinned ? (
                <span className="rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-amber-200">
                  Pinned
                </span>
              ) : null}
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="space-y-2 lg:col-span-2">
                <label className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
                  Title
                </label>
                <AppInput
                  name="title"
                  type="text"
                  defaultValue={poll.title}
                  tone="dark"
                  className="rounded-2xl"
                  required
                />
              </div>

              <div className="space-y-2 lg:col-span-2">
                <label className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
                  Description
                </label>
                <AppTextarea
                  name="description"
                  rows={3}
                  defaultValue={poll.description ?? ""}
                  tone="dark"
                  className="rounded-2xl"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
                  Category
                </label>
                <AdminSelect
                  name="categoryId"
                  value={categoryId}
                  onChange={setCategoryId}
                  placeholder="Select category"
                  options={categories.map((category) => ({
                    value: category.id,
                    label: category.name,
                  }))}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
                  Status
                </label>
                <AdminSelect
                  name="status"
                  value={status}
                  onChange={(value) => setStatus(value as AdminPoll["status"])}
                  options={[
                    { value: "draft", label: "Draft" },
                    { value: "live", label: "Live" },
                    { value: "closed", label: "Closed" },
                  ]}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
                  Image URL
                </label>
                <AppInput
                  name="imageUrl"
                  type="url"
                  defaultValue={poll.image_url ?? ""}
                  tone="dark"
                  className="rounded-2xl"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
                  Expires at
                </label>
                <AppInput
                  name="expiresAt"
                  type="datetime-local"
                  defaultValue={
                    poll.expires_at ? poll.expires_at.slice(0, 16) : ""
                  }
                  tone="dark"
                  className="rounded-2xl"
                />
              </div>
            </div>
          </div>

          <div className="grid gap-3 text-sm text-slate-300 sm:grid-cols-2 xl:min-w-[280px]">
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                Category
              </p>
              <p className="mt-2 font-semibold text-white">
                {poll.category?.name ?? "Uncategorized"}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                Total votes
              </p>
              <p className="mt-2 font-semibold text-white">
                {poll.options.reduce(
                  (sum, option) => sum + (option.vote_count ?? 0),
                  0,
                )}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                Views
              </p>
              <p className="mt-2 font-semibold text-white">{poll.view_count ?? 0}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                Sort order
              </p>
              <AppInput
                name="sortOrder"
                type="number"
                min="0"
                defaultValue={poll.sort_order ?? displayOrder}
                tone="dark"
                className="mt-2 px-3 py-2"
              />
            </div>
            <label className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
              <input
                name="isFeatured"
                type="checkbox"
                className="accent-cyan-300"
                defaultChecked={Boolean(poll.is_featured)}
              />
              Featured
            </label>
            <label className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
              <input
                name="isPinned"
                type="checkbox"
                className="accent-cyan-300"
                defaultChecked={Boolean(poll.is_pinned)}
              />
              Pinned
            </label>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h4 className="text-lg font-semibold text-white">Poll options</h4>
              <p className="mt-1 text-sm text-slate-400">
                Drag to reorder options, then save the poll to update option `sort_order`.
              </p>
            </div>
            <AppButton
              type="button"
              onClick={addOption}
              variant="secondary"
            >
              Add option
            </AppButton>
          </div>

          <div className="grid gap-3">
            {options.map((option, index) => (
              <div
                key={option.tempId}
                draggable
                onDragStart={() => setDraggingOptionId(option.tempId)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => {
                  if (draggingOptionId) {
                    moveOption(draggingOptionId, option.tempId);
                  }
                  setDraggingOptionId(null);
                }}
                onDragEnd={() => setDraggingOptionId(null)}
                className={`rounded-2xl border border-white/10 bg-white/5 p-4 transition ${
                  draggingOptionId === option.tempId ? "opacity-60" : "opacity-100"
                }`}
              >
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">
                      Option {index + 1}
                    </span>
                    <span className="text-xs text-slate-400">
                      {option.vote_count ?? 0} votes
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeOption(option.tempId)}
                    disabled={options.length <= 2}
                    className="rounded-full border border-red-400/20 bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-200 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Remove
                  </button>
                </div>

                <div className="grid gap-3 lg:grid-cols-[0.9fr_1.1fr]">
                  <AppInput
                    type="text"
                    value={option.label}
                    onChange={(event) =>
                      updateOptionField(option.tempId, "label", event.target.value)
                    }
                    placeholder="Option label"
                    tone="dark"
                    className="rounded-2xl"
                  />
                  <AppInput
                    type="text"
                    value={option.description}
                    onChange={(event) =>
                      updateOptionField(
                        option.tempId,
                        "description",
                        event.target.value,
                      )
                    }
                    placeholder="Option description"
                    tone="dark"
                    className="rounded-2xl"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {state.error ? (
          <p className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {state.error}
          </p>
        ) : null}

        {state.success ? (
          <p className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
            {state.success}
          </p>
        ) : null}

        <div className="flex flex-wrap items-center gap-3">
          <AppButton
            type="submit"
            size="lg"
          >
            Save poll changes
          </AppButton>
          <p className="text-sm text-slate-400">
            Save after reordering or editing options to persist the new structure.
          </p>
        </div>
      </form>
    </article>
  );
}
