"use client";

import { useActionState } from "react";
import { AppInput } from "@/components/form-controls";
import { createCategory } from "@/features/admin/actions";
import type { AdminActionState } from "@/features/admin/types";

const initialState: AdminActionState = {};

export function CategoryCreateForm() {
  const [state, formAction] = useActionState(createCategory, initialState);

  return (
    <form action={formAction} className="grid gap-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="category-name" className="text-sm font-medium text-slate-200">
            Category name
          </label>
          <AppInput
            id="category-name"
            name="name"
            type="text"
            placeholder="Product"
            tone="dark"
            className="rounded-2xl"
            required
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="category-slug" className="text-sm font-medium text-slate-200">
            Slug
          </label>
          <AppInput
            id="category-slug"
            name="slug"
            type="text"
            placeholder="product"
            tone="dark"
            className="rounded-2xl"
          />
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

      <button
        type="submit"
        className="inline-flex w-fit items-center justify-center rounded-2xl bg-cyan-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
      >
        Create category
      </button>
    </form>
  );
}
