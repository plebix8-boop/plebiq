"use client";

import { useActionState, useEffect, useState, type ReactNode } from "react";
import { AppSelect, AppTextarea } from "@/components/form-controls";
import { AppButton, buttonClassName } from "@/components/ui/button";
import { submitFeedback } from "@/features/feedback/actions";
import {
  feedbackCategoryLabels,
  feedbackCategories,
  type FeedbackActionState,
} from "@/features/feedback/types";

const initialState: FeedbackActionState = {};

type FeedbackButtonProps = {
  userEmail: string;
  className?: string;
  children?: ReactNode;
  onOpen?: () => void;
};

export function FeedbackButton({
  userEmail,
  className = buttonClassName({ variant: "secondary" }),
  children = "Feedback",
  onOpen,
}: FeedbackButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => {
          onOpen?.();
          setOpen(true);
        }}
        className={className}
      >
        {children}
      </button>

      {open ? (
        <FeedbackModal userEmail={userEmail} onClose={() => setOpen(false)} />
      ) : null}
    </>
  );
}

function FeedbackModal({
  userEmail,
  onClose,
}: {
  userEmail: string;
  onClose: () => void;
}) {
  const [state, formAction, pending] = useActionState(
    submitFeedback,
    initialState,
  );
  const [category, setCategory] = useState("suggestion");
  const [message, setMessage] = useState("");

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  useEffect(() => {
    if (state.success) {
      queueMicrotask(() => setMessage(""));
    }
  }, [state.success]);

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center px-4 py-4 backdrop-blur-md sm:items-center sm:px-6"
      onClick={onClose}
      role="presentation"
      style={{ backgroundColor: "var(--shadow-soft)" }}
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-landing-profile-menu-border bg-landing-profile-menu-bg p-5 text-landing-profile-menu-text shadow-[0_24px_70px_var(--shadow-soft)] sm:p-6"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="feedback-title"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="feedback-title" className="text-lg font-semibold">
              Send feedback
            </h2>
            <p className="mt-1 text-sm text-landing-profile-menu-muted">
              Share what should improve, break, or ship next.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid size-8 shrink-0 place-items-center rounded-full bg-landing-profile-menu-item-bg-hover text-landing-profile-menu-muted transition hover:text-landing-profile-menu-text"
            aria-label="Close feedback form"
          >
            <svg className="size-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <form action={formAction} className="mt-5 space-y-4">
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-landing-profile-menu-muted">
              Email
            </label>
            <div className="rounded-xl border border-field-light-border bg-field-light-bg px-4 py-3 text-sm text-field-light-text">
              {userEmail}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-landing-profile-menu-muted">
              Category
            </label>
            <AppSelect
              name="category"
              value={category}
              onChange={setCategory}
              options={feedbackCategories.map((value) => ({
                value,
                label: feedbackCategoryLabels[value],
              }))}
              tone="light"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-landing-profile-menu-muted">
              Message
            </label>
            <AppTextarea
              name="message"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              minLength={10}
              required
              rows={5}
              tone="light"
              placeholder="Tell us what happened or what you want to see..."
            />
            <p className="mt-2 text-xs text-landing-profile-menu-muted">
              Minimum 10 characters. Limit: 5 submissions per day.
            </p>
          </div>

          {state.error ? (
            <p className="rounded-xl border border-admin-card-border bg-admin-surface px-4 py-3 text-sm text-admin-danger-text">
              {state.error}
            </p>
          ) : null}
          {state.success ? (
            <p className="rounded-xl border border-admin-card-border bg-admin-surface px-4 py-3 text-sm text-admin-success-text">
              {state.success}
            </p>
          ) : null}

          <div className="flex flex-col-reverse gap-3 pt-1 sm:flex-row sm:justify-end">
            <AppButton
              type="button"
              onClick={onClose}
              variant="secondary"
            >
              Close
            </AppButton>
            <AppButton
              type="submit"
              disabled={pending || message.trim().length < 10}
            >
              {pending ? "Sending..." : "Submit feedback"}
            </AppButton>
          </div>
        </form>
      </div>
    </div>
  );
}
