"use client";

import { useActionState } from "react";
import { signUp } from "@/features/auth/actions";
import type { AuthFormState } from "@/features/auth/types";
import { AppInput } from "@/components/form-controls";
import { AuthSubmitButton } from "./auth-submit-button";
import { PasswordInput } from "./password-input";
import { CountrySelect } from "./country-select";

const initialState: AuthFormState = {};

const labelClass = "block text-xs font-semibold uppercase tracking-wide text-slate-500";

export function SignUpForm() {
  const [state, formAction] = useActionState(signUp, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="sign-up-name" className={labelClass}>
          Full name
        </label>
        <AppInput
          id="sign-up-name"
          name="name"
          type="text"
          autoComplete="name"
          placeholder="Your name"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="sign-up-email" className={labelClass}>
          Email
        </label>
        <AppInput
          id="sign-up-email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          required
        />
      </div>

      <div className="space-y-1.5">
        <label className={labelClass} htmlFor="sign-up-country">
          Country
        </label>
        <CountrySelect id="sign-up-country" name="country" />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="sign-up-password" className={labelClass}>
          Password
        </label>
        <PasswordInput
          id="sign-up-password"
          name="password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
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

      <AuthSubmitButton idleLabel="Create account" pendingLabel="Creating…" />
    </form>
  );
}
