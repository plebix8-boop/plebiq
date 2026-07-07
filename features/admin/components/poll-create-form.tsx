"use client";

import { useActionState, useState } from "react";
import { AppInput, AppTextarea } from "@/components/form-controls";
import { AppButton } from "@/components/ui/button";
import { createPoll } from "@/features/admin/actions";
import type { AdminActionState, AdminCategory } from "@/features/admin/types";
import { AdminSelect } from "@/features/admin/components/ui/admin-select";
import { AdminDateTimePicker } from "@/features/admin/components/ui/admin-date-time-picker";
import { AdminToggle } from "@/features/admin/components/ui/admin-toggle";

const initialState: AdminActionState = {};

type PollCreateFormProps = {
  categories: AdminCategory[];
};

type DraftOption = {
  tempId: string;
  label: string;
  description: string;
};

function createTempId() {
  return Math.random().toString(36).slice(2, 11);
}

export function PollCreateForm({ categories }: PollCreateFormProps) {
  const [state, formAction] = useActionState(createPoll, initialState);
  const [categoryId, setCategoryId] = useState("");
  const [pollStatus, setPollStatus] = useState("draft");
  const [expiresAt, setExpiresAt] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [options, setOptions] = useState<DraftOption[]>([
    { tempId: createTempId(), label: "", description: "" },
    { tempId: createTempId(), label: "", description: "" },
  ]);
  const [draggingOptionId, setDraggingOptionId] = useState<string | null>(null);

  const serializedOptions = JSON.stringify(
    options.map((option, index) => ({
      label: option.label,
      description: option.description,
      sort_order: index,
    })),
  );

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
      { tempId: createTempId(), label: "", description: "" },
    ]);
  }

  function removeOption(tempId: string) {
    setOptions((currentOptions) =>
      currentOptions.filter((option) => option.tempId !== tempId),
    );
  }

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

      return nextOptions;
    });
  }

  return (
    <form action={formAction} className="grid gap-4">
      <input name="optionsJson" type="hidden" value={serializedOptions} />

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-2 lg:col-span-2">
          <label htmlFor="poll-title" className="text-sm font-medium text-slate-200">
            Poll title
          </label>
          <AppInput
            id="poll-title"
            name="title"
            type="text"
            placeholder="Which product direction should we ship next?"
            tone="dark"
            className="rounded-2xl"
            required
          />
        </div>

        <div className="space-y-2 lg:col-span-2">
          <label
            htmlFor="poll-description"
            className="text-sm font-medium text-slate-200"
          >
            Description
          </label>
          <AppTextarea
            id="poll-description"
            name="description"
            rows={3}
            placeholder="Give admins and voters a quick summary of what this poll is about."
            tone="dark"
            className="rounded-2xl"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-200">Category</label>
          <AdminSelect
            name="categoryId"
            value={categoryId}
            onChange={setCategoryId}
            placeholder="Select a category"
            options={categories.map((c) => ({ value: c.id, label: c.name }))}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-200">Status</label>
          <AdminSelect
            name="status"
            value={pollStatus}
            onChange={setPollStatus}
            options={[
              { value: "draft", label: "Draft" },
              { value: "live", label: "Live" },
              { value: "closed", label: "Closed" },
            ]}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="poll-image" className="text-sm font-medium text-slate-200">
            Image URL
          </label>
          <AppInput
            id="poll-image"
            name="imageUrl"
            type="url"
            placeholder="https://..."
            tone="dark"
            className="rounded-2xl"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-200">Expires at</label>
          <AdminDateTimePicker
            name="expiresAt"
            value={expiresAt}
            onChange={setExpiresAt}
            placeholder="No expiry"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="poll-sort-order" className="text-sm font-medium text-slate-200">
            Sort order
          </label>
          <AppInput
            id="poll-sort-order"
            name="sortOrder"
            type="number"
            min="0"
            placeholder="0"
            tone="dark"
            className="rounded-2xl"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        {isFeatured && <input type="hidden" name="isFeatured" value="on" />}
        {isPinned && <input type="hidden" name="isPinned" value="on" />}
        <AdminToggle
          checked={isFeatured}
          onChange={setIsFeatured}
          label="Featured"
          description="Shown in the hero section"
        />
        <AdminToggle
          checked={isPinned}
          onChange={setIsPinned}
          label="Pinned"
          description="Always appears at the top"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <label className="text-sm font-medium text-slate-200">
            Poll options
          </label>
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
              className={`rounded-2xl border border-white/10 bg-slate-950/40 p-4 transition ${
                draggingOptionId === option.tempId ? "opacity-60" : "opacity-100"
              }`}
            >
              <div className="mb-3 flex items-center justify-between gap-3">
                <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">
                  Option {index + 1}
                </span>
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

        <p className="text-xs leading-5 text-slate-400">
          Add each option separately and drag cards to change their order.
        </p>
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

      <AppButton
        type="submit"
        size="lg"
        className="w-fit"
      >
        Create poll
      </AppButton>
    </form>
  );
}
