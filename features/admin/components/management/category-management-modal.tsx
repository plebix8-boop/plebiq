"use client";

import { useMemo, useState, useTransition } from "react";
import { AppInput } from "@/components/form-controls";
import { AppButton } from "@/components/ui/button";
import {
  createCategory,
  deleteCategory,
  updateCategory,
} from "@/features/admin/actions";
import type { AdminCategory, CategoryActionState } from "@/features/admin/types";

export type ManagedCategory = Pick<AdminCategory, "id" | "name" | "slug">;

type CategoryManagementModalProps = {
  categories: ManagedCategory[];
  onClose: () => void;
  onCategoryCreated: (category: ManagedCategory) => void;
  onCategoryUpdated: (
    previousCategory: ManagedCategory,
    nextCategory: ManagedCategory,
  ) => void;
  onCategoryDeleted: (category: ManagedCategory) => void;
};

function normalizeCategory(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

function normalizeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const slugPattern = "^[a-z0-9]+(?:-[a-z0-9]+)*$";

export function CategoryManagementModal({
  categories,
  onClose,
  onCategoryCreated,
  onCategoryUpdated,
  onCategoryDeleted,
}: CategoryManagementModalProps) {
  const [draftName, setDraftName] = useState("");
  const [draftSlug, setDraftSlug] = useState("");
  const [isDraftSlugManuallyEdited, setIsDraftSlugManuallyEdited] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState({ name: "", slug: "" });
  const [isEditingSlugManuallyEdited, setIsEditingSlugManuallyEdited] =
    useState(false);
  const [feedback, setFeedback] = useState<CategoryActionState>({});
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const sortedItems = useMemo(
    () => [...categories].sort((a, b) => a.name.localeCompare(b.name)),
    [categories],
  );

  function ensureValidCategory(
    name: string,
    slug: string,
    ignoreId?: string,
  ) {
    const normalizedName = normalizeCategory(name);
    const normalizedSlug = normalizeSlug(slug);

    if (!normalizedName) {
      setFeedback({ error: "Category name is required." });
      return null;
    }

    if (!normalizedSlug) {
      setFeedback({ error: "Category slug is required." });
      return null;
    }

    const slugExists = categories.some(
      (item) =>
        item.slug.toLowerCase() === normalizedSlug.toLowerCase() &&
        item.id !== ignoreId,
    );

    if (slugExists) {
      setFeedback({ error: "That category slug already exists." });
      return null;
    }

    return {
      name: normalizedName,
      slug: normalizedSlug,
    };
  }

  function runAction(
    actionName: string,
    request: () => Promise<CategoryActionState>,
  ) {
    setPendingAction(actionName);
    startTransition(() => {
      void (async () => {
        try {
          const result = await request();
          setFeedback(result);
        } finally {
          setPendingAction(null);
        }
      })();
    });
  }

  function handleAddCategory() {
    const nextCategory = ensureValidCategory(draftName, draftSlug || draftName);

    if (!nextCategory) {
      return;
    }

    runAction("create", async () => {
      const formData = new FormData();
      formData.set("name", nextCategory.name);
      formData.set("slug", nextCategory.slug);

      const result = await createCategory({}, formData);

      if (result.category) {
        onCategoryCreated(result.category);
        setDraftName("");
        setDraftSlug("");
        setIsDraftSlugManuallyEdited(false);
      }

      return result;
    });
  }

  function handleStartEdit(category: ManagedCategory) {
    setEditingId(category.id);
    setEditingValue({
      name: category.name,
      slug: category.slug,
    });
    setIsEditingSlugManuallyEdited(false);
    setFeedback({});
  }

  function handleSaveEdit() {
    if (!editingId) {
      return;
    }

    const previousCategory = categories.find((category) => category.id === editingId);

    if (!previousCategory) {
      setFeedback({ error: "Unable to find that category." });
      return;
    }

    const nextCategory = ensureValidCategory(
      editingValue.name,
      editingValue.slug,
      previousCategory.id,
    );

    if (!nextCategory) {
      return;
    }

    runAction(`update:${editingId}`, async () => {
      const formData = new FormData();
      formData.set("categoryId", previousCategory.id);
      formData.set("name", nextCategory.name);
      formData.set("slug", nextCategory.slug);

      const result = await updateCategory({}, formData);

      if (result.category) {
        onCategoryUpdated(previousCategory, result.category);
        setEditingId(null);
        setEditingValue({ name: "", slug: "" });
        setIsEditingSlugManuallyEdited(false);
      }

      return result;
    });
  }

  function handleDeleteCategory(category: ManagedCategory) {
    const shouldDelete = window.confirm(
      `Delete "${category.name}"? Polls using it will need reassignment later.`,
    );

    if (!shouldDelete) {
      return;
    }

    runAction(`delete:${category.id}`, async () => {
      const formData = new FormData();
      formData.set("categoryId", category.id);

      const result = await deleteCategory({}, formData);

      if (result.deletedCategoryId) {
        onCategoryDeleted(category);
      }

      return result;
    });
  }

  const busy = isPending && pendingAction !== null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="flex h-[min(80vh,760px)] w-full max-w-2xl flex-col rounded-[1.75rem] border border-white/10 bg-surface shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-white/8 px-6 py-5">
          <div>
            <h2 className="text-lg font-bold text-white">Category Management</h2>
            <p className="mt-1 text-sm text-slate-500">
              Create, edit, and remove real Supabase categories from one place.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex size-9 items-center justify-center rounded-xl text-slate-500 transition hover:bg-white/8 hover:text-white"
          >
            <svg
              className="size-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18 18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="scrollbar-thin flex-1 overflow-y-auto px-6 py-5">
          <div className="space-y-6">
            <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Add category
              </label>
              <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
                <AppInput
                  type="text"
                  value={draftName}
                  onChange={(event) => {
                    const nextName = event.target.value;
                    setDraftName(nextName);

                    if (!isDraftSlugManuallyEdited) {
                      setDraftSlug(normalizeSlug(nextName));
                    }
                  }}
                  placeholder="Category name"
                  tone="dark"
                  className="py-2.5"
                />
                <AppInput
                  type="text"
                  value={draftSlug}
                  onChange={(event) => {
                    setDraftSlug(normalizeSlug(event.target.value));
                    setIsDraftSlugManuallyEdited(true);
                  }}
                  placeholder="category-slug"
                  pattern={slugPattern}
                  title="Use lowercase letters, numbers, and hyphens only."
                  tone="dark"
                  className="py-2.5"
                />
                <AppButton
                  type="button"
                  disabled={busy}
                  onClick={handleAddCategory}
                >
                  {pendingAction === "create" ? "Adding..." : "Add Category"}
                </AppButton>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Existing categories
                </p>
                <span className="rounded-full bg-white/8 px-2.5 py-1 text-xs font-semibold text-slate-400">
                  {sortedItems.length}
                </span>
              </div>

              <div className="grid gap-3">
                {sortedItems.map((category) => {
                  const isEditing = editingId === category.id;

                  return (
                    <div
                      key={category.id}
                      className="flex flex-col gap-3 rounded-2xl border border-white/8 bg-white/[0.03] p-4"
                    >
                      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                        {isEditing ? (
                          <>
                            <AppInput
                              type="text"
                              value={editingValue.name}
                              onChange={(event) => {
                                const nextName = event.target.value;
                                setEditingValue((current) => ({
                                  ...current,
                                  name: nextName,
                                  slug: isEditingSlugManuallyEdited
                                    ? current.slug
                                    : normalizeSlug(nextName),
                                }));
                              }}
                              tone="dark"
                              className="py-2.5"
                            />
                            <AppInput
                              type="text"
                              value={editingValue.slug}
                              onChange={(event) => {
                                setEditingValue((current) => ({
                                  ...current,
                                  slug: normalizeSlug(event.target.value),
                                }));
                                setIsEditingSlugManuallyEdited(true);
                              }}
                              pattern={slugPattern}
                              title="Use lowercase letters, numbers, and hyphens only."
                              tone="dark"
                              className="py-2.5"
                            />
                          </>
                        ) : (
                          <>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-white">
                                {category.name}
                              </p>
                              <p className="mt-1 text-xs text-slate-500">Name</p>
                            </div>
                            <div className="min-w-0">
                              <p className="truncate font-mono text-sm text-slate-300">
                                {category.slug}
                              </p>
                              <p className="mt-1 text-xs text-slate-500">Slug</p>
                            </div>
                          </>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2 sm:justify-end">
                        {isEditing ? (
                          <>
                            <AppButton
                              type="button"
                              disabled={busy}
                              onClick={handleSaveEdit}
                              size="sm"
                            >
                              {pendingAction === `update:${category.id}` ? "Saving..." : "Save"}
                            </AppButton>
                            <AppButton
                              type="button"
                              disabled={busy}
                              onClick={() => {
                                setEditingId(null);
                                setEditingValue({ name: "", slug: "" });
                                setIsEditingSlugManuallyEdited(false);
                                setFeedback({});
                              }}
                              variant="secondary"
                              size="sm"
                            >
                              Cancel
                            </AppButton>
                          </>
                        ) : (
                          <AppButton
                            type="button"
                            disabled={busy}
                            onClick={() => handleStartEdit(category)}
                            variant="secondary"
                            size="sm"
                          >
                            Edit
                          </AppButton>
                        )}

                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => handleDeleteCategory(category)}
                          className="rounded-xl border border-rose-400/20 bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-200 transition hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {pendingAction === `delete:${category.id}` ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {feedback.error ? (
              <p className="rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                {feedback.error}
              </p>
            ) : null}

            {feedback.success ? (
              <p className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                {feedback.success}
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-white/8 px-6 py-4">
          <AppButton
            type="button"
            onClick={onClose}
            variant="secondary"
          >
            Close
          </AppButton>
        </div>
      </div>
    </div>
  );
}
