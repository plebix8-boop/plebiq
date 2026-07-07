"use client";

import { useActionState } from "react";
import { signIn } from "@/features/auth/actions";
import type { AuthFormState } from "@/features/auth/types";
import { AppInput } from "@/components/form-controls";
import { AuthSubmitButton } from "./auth-submit-button";
import { PasswordInput } from "./password-input";

const initialState: AuthFormState = {};

export function SignInForm() {
  const [state, formAction] = useActionState(signIn, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="sign-in-email" className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
          Email
        </label>
        <AppInput
          id="sign-in-email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          required
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="sign-in-password" className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
          Password
        </label>
        <PasswordInput
          id="sign-in-password"
          name="password"
          autoComplete="current-password"
          placeholder="Your password"
          required
        />
      </div>

      {state.error && (
        <p className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
          {state.error}
        </p>
      )}

      {state.info && (
        <p className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          {state.info}
        </p>
      )}

      <AuthSubmitButton idleLabel="Sign in" pendingLabel="Signing in…" />
    </form>
  );
}
