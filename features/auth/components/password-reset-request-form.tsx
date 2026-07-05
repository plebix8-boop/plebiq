"use client";

import { useActionState } from "react";
import { requestPasswordReset } from "@/features/auth/actions";
import type { AuthFormState } from "@/features/auth/types";
import { AppInput } from "@/components/form-controls";
import { AuthSubmitButton } from "./auth-submit-button";

const initialState: AuthFormState = {};

export function PasswordResetRequestForm() {
  const [state, formAction] = useActionState(requestPasswordReset, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="reset-email" className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
          Email
        </label>
        <AppInput
          id="reset-email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          required
        />
      </div>

      {state.error && (
        <p className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
          {state.error}
        </p>
      )}

      {state.success && (
        <p className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {state.success}
        </p>
      )}

      <AuthSubmitButton idleLabel="Send reset link" pendingLabel="Sending…" />
    </form>
  );
}
