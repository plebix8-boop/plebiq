"use client";

import { startTransition, useEffect, useRef, useState } from "react";
import { AppInput, AppTextarea } from "@/components/form-controls";
import { AppButton } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { createPoll, updatePoll } from "@/features/admin/actions";
import type { AdminActionState, AdminPoll, AdminPollOption } from "@/features/admin/types";
import type { ManagedCategory } from "./category-management-modal";
import { AdminSelect } from "@/features/admin/components/ui/admin-select";
import { AdminDateTimePicker } from "@/features/admin/components/ui/admin-date-time-picker";
import { AdminToggle } from "@/features/admin/components/ui/admin-toggle";

type EditableOption = {
  id: string;
  label: string;
  description: string;
};

function createOption(): EditableOption {
  return {
    id: `new-${Math.random().toString(36).slice(2, 10)}`,
    label: "",
    description: "",
  };
}

function createExistingOption(option: AdminPollOption): EditableOption {
  return {
    id: option.id,
    label: option.label,
    description: option.description,
  };
}

function GripIcon() {
  return (
    <svg className="size-4 text-admin-text-muted" viewBox="0 0 16 16" fill="currentColor">
      <circle cx="5" cy="4" r="1.2" />
      <circle cx="11" cy="4" r="1.2" />
      <circle cx="5" cy="8" r="1.2" />
      <circle cx="11" cy="8" r="1.2" />
      <circle cx="5" cy="12" r="1.2" />
      <circle cx="11" cy="12" r="1.2" />
    </svg>
  );
}

const labelClass =
  "mb-1.5 block text-xs font-semibold uppercase tracking-wider text-admin-text-muted";

type NewPollModalProps = {
  onClose: () => void;
  poll?: AdminPoll;
  categories: ManagedCategory[];
};

export function NewPollModal({
  onClose,
  poll,
  categories,
}: NewPollModalProps) {
  const router = useRouter();
  const isEdit = Boolean(poll);
  const overlayRef = useRef<HTMLDivElement>(null);
  const dragIndex = useRef<number | null>(null);
  const dragOverIndex = useRef<number | null>(null);

  const [title, setTitle] = useState(poll?.title ?? "");
  const [description, setDescription] = useState(poll?.description ?? "");
  const [imageUrl, setImageUrl] = useState(poll?.image_url ?? "");
  const [sortOrder, setSortOrder] = useState(
    poll?.sort_order !== null && poll?.sort_order !== undefined
      ? String(poll.sort_order)
      : "",
  );
  const [categoryId, setCategoryId] = useState(poll?.category?.id ?? "");
  const [status, setStatus] = useState<AdminPoll["status"]>(poll?.status ?? "draft");
  const [expiresAt, setExpiresAt] = useState(
    poll?.expires_at ? poll.expires_at.slice(0, 16) : "",
  );
  const [isFeatured, setIsFeatured] = useState(Boolean(poll?.is_featured));
  const [isPinned, setIsPinned] = useState(Boolean(poll?.is_pinned));
  const [options, setOptions] = useState<EditableOption[]>(() =>
    poll?.options?.length
      ? poll.options.map(createExistingOption)
      : [createOption(), createOption()],
  );
  const [result, setResult] = useState<AdminActionState>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState({
    category: false,
    optionIds: [] as string[],
    title: false,
  });

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function addOption() {
    setOptions((current) => [...current, createOption()]);
  }

  function removeOption(id: string) {
    setOptions((current) =>
      current.length <= 2 ? current : current.filter((option) => option.id !== id),
    );
  }

  function updateOptionField(
    id: string,
    field: "label" | "description",
    value: string,
  ) {
    setOptions((current) =>
      current.map((option) =>
        option.id === id ? { ...option, [field]: value } : option,
      ),
    );
  }

  function onDragStart(index: number) {
    dragIndex.current = index;
  }

  function onDragOver(event: React.DragEvent, index: number) {
    event.preventDefault();
    dragOverIndex.current = index;
  }

  function onDrop() {
    const from = dragIndex.current;
    const to = dragOverIndex.current;

    if (from === null || to === null || from === to) {
      return;
    }

    setOptions((current) => {
      const next = [...current];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
    dragIndex.current = null;
    dragOverIndex.current = null;
  }

  function handleSubmit() {
    const invalidOptionIds = options
      .filter((option) => !option.label.trim())
      .map((option) => option.id);
    const nextValidationErrors = {
      category: !categoryId,
      optionIds: invalidOptionIds,
      title: !title.trim(),
    };

    if (
      nextValidationErrors.title ||
      nextValidationErrors.category ||
      nextValidationErrors.optionIds.length > 0
    ) {
      setValidationErrors(nextValidationErrors);
      setResult({
        error: "Please fix the highlighted fields before saving this poll.",
      });
      return;
    }

    if (options.length < 2) {
      setResult({ error: "Add at least two options." });
      return;
    }

    setIsSubmitting(true);
    setResult({});
    setValidationErrors({ category: false, optionIds: [], title: false });

    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.set("title", title);
        formData.set("description", description);
        formData.set("categoryId", categoryId);
        formData.set("status", status);
        formData.set("imageUrl", imageUrl);
        formData.set("sortOrder", sortOrder);
        formData.set("expiresAt", expiresAt);
        formData.set(
          "optionsJson",
          JSON.stringify(
            options.map((option, index) => ({
              id: option.id,
              label: option.label,
              description: option.description,
              sort_order: index,
            })),
          ),
        );

        if (isFeatured) {
          formData.set("isFeatured", "on");
        }

        if (isPinned) {
          formData.set("isPinned", "on");
        }

        let actionResult: AdminActionState;

        if (poll) {
          formData.set("pollId", poll.id);
          actionResult = await updatePoll({}, formData);
        } else {
          actionResult = await createPoll({}, formData);
        }

        setResult(actionResult);

        if (actionResult.success) {
          router.refresh();
          onClose();
        }
      } finally {
        setIsSubmitting(false);
      }
    });
  }

  return (
    <div
      ref={overlayRef}
      onClick={(event) => {
        if (event.target === overlayRef.current) {
          onClose();
        }
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
    >
      <div className="relative flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-admin-card-border bg-admin-card-bg text-admin-text shadow-2xl">
        <div className="flex shrink-0 items-center justify-between border-b border-admin-divider px-6 py-4">
          <div>
            <h2 className="text-base font-bold text-admin-text">
              {isEdit ? "Edit Poll" : "Create New Poll"}
            </h2>
            <p className="mt-0.5 text-xs text-admin-text-muted">
              {isEdit ? "Update the real poll record and its options." : "Create a real poll in Supabase."}
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-lg text-admin-text-muted transition hover:bg-admin-button-secondary-bg-hover hover:text-admin-text"
          >
            <svg className="size-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="scrollbar-thin flex-1 overflow-y-auto px-6 py-5">
          <div className="space-y-5">
            <div>
              <label className={labelClass}>
                Title <span className="text-admin-danger-text">*</span>
              </label>
              <AppInput
                aria-invalid={validationErrors.title}
                type="text"
                placeholder="Poll title"
                value={title}
                onChange={(event) => {
                  setTitle(event.target.value);
                  setValidationErrors((current) => ({ ...current, title: false }));
                }}
                tone="dark"
                className={`py-2.5 ${validationErrors.title ? "border-admin-danger-text ring-2 ring-admin-danger-text/25" : ""}`}
              />
              {validationErrors.title ? (
                <p className="mt-1.5 text-xs font-semibold text-admin-danger-text">
                  Enter a title for the poll.
                </p>
              ) : null}
            </div>

            <div>
              <label className={labelClass}>
                Description <span className="normal-case tracking-normal text-admin-text-subtle">(Optional)</span>
              </label>
              <AppTextarea
                rows={3}
                placeholder="Add context for voters"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                tone="dark"
                className="resize-none py-2.5"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className={validationErrors.category ? "rounded-xl ring-2 ring-admin-danger-text/40" : ""}>
                <label className={labelClass}>
                  Category <span className="text-admin-danger-text">*</span>
                </label>
                <AdminSelect
                  value={categoryId}
                  onChange={(value) => {
                    setCategoryId(value);
                    setValidationErrors((current) => ({ ...current, category: false }));
                  }}
                  placeholder="Select category"
                  options={categories.map((c) => ({ value: c.id, label: c.name }))}
                />
                {validationErrors.category ? (
                  <p className="mt-1.5 text-xs font-semibold text-admin-danger-text">
                    Choose a category for this poll.
                  </p>
                ) : null}
              </div>
              <div>
                <label className={labelClass}>Status</label>
                <AdminSelect
                  value={status}
                  onChange={(v) => setStatus(v as AdminPoll["status"])}
                  options={[
                    { value: "draft", label: "Draft" },
                    { value: "live", label: "Live" },
                    { value: "closed", label: "Closed" },
                  ]}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className={labelClass}>Image URL</label>
                <AppInput
                  type="url"
                  placeholder="https://..."
                  value={imageUrl}
                  onChange={(event) => setImageUrl(event.target.value)}
                  tone="dark"
                  className="py-2.5"
                />
              </div>
              <div>
                <label className={labelClass}>Sort Order</label>
                <AppInput
                  type="number"
                  min={0}
                  value={sortOrder}
                  onChange={(event) => setSortOrder(event.target.value)}
                  tone="dark"
                  className="py-2.5"
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Expires At</label>
              <AdminDateTimePicker
                value={expiresAt}
                onChange={setExpiresAt}
                placeholder="No expiry"
              />
            </div>

            <div className="flex flex-wrap gap-3">
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

            <div>
              <div className="mb-3 flex items-center justify-between">
                <label className={`${labelClass} mb-0`}>
                  Poll Options <span className="text-admin-danger-text">*</span>
                </label>
                <AppButton
                  type="button"
                  onClick={addOption}
                  variant="secondary"
                  size="sm"
                >
                  Add Option
                </AppButton>
              </div>

              <div className="space-y-3">
                {options.map((option, index) => (
                  <div
                    key={option.id}
                    draggable
                    onDragStart={() => onDragStart(index)}
                    onDragOver={(event) => onDragOver(event, index)}
                    onDrop={onDrop}
                    onDragEnd={() => {
                      dragIndex.current = null;
                      dragOverIndex.current = null;
                    }}
                    className={`rounded-xl border bg-admin-surface p-4 transition ${validationErrors.optionIds.includes(option.id) ? "border-admin-danger-text ring-2 ring-admin-danger-text/20" : "border-admin-card-border hover:border-admin-card-border-hover"}`}
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="cursor-grab active:cursor-grabbing" title="Drag to reorder">
                          <GripIcon />
                        </span>
                        <span className="text-xs font-semibold text-admin-text-muted">
                          Option {index + 1}
                        </span>
                      </div>
                      {options.length > 2 ? (
                        <button
                          type="button"
                          onClick={() => removeOption(option.id)}
                          className="rounded-lg px-2 py-1 text-xs font-semibold text-admin-danger-text transition hover:bg-admin-surface-hover"
                        >
                          Remove
                        </button>
                      ) : null}
                    </div>

                    <div className="space-y-2.5">
                      <AppInput
                        type="text"
                        placeholder="Option title"
                        value={option.label}
                        onChange={(event) =>
                          {
                            updateOptionField(option.id, "label", event.target.value);
                            setValidationErrors((current) => ({
                              ...current,
                              optionIds: current.optionIds.filter((id) => id !== option.id),
                            }));
                          }
                        }
                        tone="dark"
                        className="py-2.5"
                      />
                      <AppInput
                        type="text"
                        placeholder="Option description (optional)"
                        value={option.description}
                        onChange={(event) =>
                          {
                            updateOptionField(
                              option.id,
                              "description",
                              event.target.value,
                            );
                          }
                        }
                        tone="dark"
                        className="py-2.5"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {result.error ? (
              <div className="flex gap-3 rounded-2xl border border-admin-danger-text/60 bg-danger-soft px-4 py-3 text-sm font-semibold text-admin-danger-text shadow-[0_12px_32px_var(--shadow-soft)]" role="alert">
                <span aria-hidden="true" className="grid size-6 shrink-0 place-items-center rounded-full bg-admin-danger-text text-xs font-black text-admin-bg">!</span>
                <span className="pt-0.5">{result.error}</span>
              </div>
            ) : null}
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-end gap-3 border-t border-admin-divider px-6 py-4">
          <AppButton
            onClick={onClose}
            variant="secondary"
          >
            Cancel
          </AppButton>
          <AppButton
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting
              ? isEdit
                ? "Updating..."
                : "Creating..."
              : isEdit
                ? "Update Poll"
                : "Create Poll"}
          </AppButton>
        </div>
      </div>
    </div>
  );
}
