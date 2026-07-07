"use client";

import { useFormStatus } from "react-dom";
import { AppButton } from "@/components/ui/button";

type AuthSubmitButtonProps = {
  idleLabel: string;
  pendingLabel: string;
};

export function AuthSubmitButton({ idleLabel, pendingLabel }: AuthSubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <AppButton
      type="submit"
      disabled={pending}
      size="lg"
      className="relative w-full overflow-hidden"
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
    </AppButton>
  );
}
