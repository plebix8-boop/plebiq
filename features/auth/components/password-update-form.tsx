"use client";

import { useActionState } from "react";
import { updatePassword } from "@/features/auth/actions";
import type { AuthFormState } from "@/features/auth/types";
import { AuthSubmitButton } from "./auth-submit-button";
import { PasswordInput } from "./password-input";

const initialState: AuthFormState = {};

type PasswordUpdateFormProps = {
  email?: string;
};

const labelClass = "block text-xs font-semibold uppercase tracking-wide text-slate-500";

export function PasswordUpdateForm({ email }: PasswordUpdateFormProps) {
  const [state, formAction] = useActionState(updatePassword, initialState);

  return (
    <form action={formAction} className="space-y-4">
      {email && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          Resetting password for{" "}
          <span className="font-semibold text-slate-900">{email}</span>
        </div>
      )}

      <div className="space-y-1.5">
        <label htmlFor="new-password" className={labelClass}>
          New password
        </label>
        <PasswordInput
          id="new-password"
          name="password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          required
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="confirm-password" className={labelClass}>
          Confirm password
        </label>
        <PasswordInput
          id="confirm-password"
          name="confirmPassword"
          autoComplete="new-password"
          placeholder="Repeat your new password"
          required
        />
      </div>

      {state.error && (
        <p className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
          {state.error}
        </p>
      )}

      <AuthSubmitButton idleLabel="Update password" pendingLabel="Updating…" />
    </form>
  );
}
