"use client";

import { useFormStatus } from "react-dom";

type AuthSubmitButtonProps = {
  idleLabel: string;
  pendingLabel: string;
};

export function AuthSubmitButton({ idleLabel, pendingLabel }: AuthSubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="relative inline-flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-xl bg-black px-5 py-3.5 text-sm font-semibold text-white shadow-[0_4px_14px_var(--shadow-soft)] transition duration-200 hover:-translate-y-0.5 hover:bg-accent hover:shadow-[0_8px_24px_var(--shadow-soft)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:translate-y-0 disabled:hover:shadow-[0_4px_14px_var(--shadow-soft)]"
    >
      {pending && (
        <svg
          className="size-4 animate-spin text-white/70"
          fill="none"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
          <path
            className="opacity-75"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            fill="currentColor"
          />
        </svg>
      )}
      {pending ? pendingLabel : idleLabel}
    </button>
  );
}
