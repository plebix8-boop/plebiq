"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { AppButtonLink } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { FeedbackButton } from "@/features/feedback/components/feedback-button";
import { createClient } from "@/utils/supabase/client";

function getInitials(name: string | null, email: string | null) {
  if (name) {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }
  return (email?.[0] ?? "?").toUpperCase();
}

export function UserAvatarMenu() {
  const { user } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  if (!user) return null;

  const initials = getInitials(user.name, user.email);
  const displayName = user.name ?? user.email ?? "User";

  async function handleSignOut() {
    setIsSigningOut(true);
    setOpen(false);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <div className="relative" ref={ref}>
      <button
        aria-expanded={open}
        aria-label="Account menu"
        className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-landing-profile-avatar-bg-from to-landing-profile-avatar-bg-to text-sm font-bold text-landing-profile-avatar-text ring-2 ring-landing-profile-avatar-ring transition duration-200 hover:scale-105 hover:ring-landing-profile-avatar-ring-hover active:scale-95"
        onClick={() => setOpen((o) => !o)}
        type="button"
      >
        {initials}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="absolute right-0 top-13 z-50 w-64 overflow-hidden rounded-2xl border border-landing-profile-menu-border bg-landing-profile-menu-bg shadow-[0_24px_64px_var(--shadow-soft)]"
            exit={{ opacity: 0, y: 6, scale: 0.96 }}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
          >
            {/* User info header */}
            <div className="flex items-center gap-3 border-b border-landing-profile-menu-divider px-4 py-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-landing-profile-avatar-bg-from to-landing-profile-avatar-bg-to text-xs font-bold text-landing-profile-avatar-text">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-landing-profile-menu-text">{displayName}</p>
                {user.name && user.email && (
                  <p className="truncate text-xs text-landing-profile-menu-muted">{user.email}</p>
                )}
                {user.role === "admin" && (
                  <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-landing-profile-admin-badge-bg px-2 py-0.5 text-[10px] font-semibold text-landing-profile-admin-badge-text">
                    <span className="h-1.5 w-1.5 rounded-full bg-landing-profile-admin-badge-dot" />
                    Admin
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="p-2">
              <ThemeSwitcher className="mb-2 rounded-xl border border-landing-profile-menu-border bg-landing-profile-menu-item-bg-hover p-2" />

              {user.email && (
                <FeedbackButton
                  userEmail={user.email}
                  onOpen={() => setOpen(false)}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-landing-profile-menu-item-text transition duration-150 hover:bg-landing-profile-menu-item-bg-hover hover:text-landing-profile-menu-item-text-hover"
                >
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-landing-profile-icon-bg text-landing-profile-icon-text">
                    <svg fill="none" height="14" viewBox="0 0 14 14" width="14">
                      <path d="M2 2.5h10v6.8H5.7L3 11.5V9.3H2V2.5Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.35" />
                      <path d="M4.5 5h5M4.5 7h3" stroke="currentColor" strokeLinecap="round" strokeWidth="1.35" />
                    </svg>
                  </span>
                  Feedback
                </FeedbackButton>
              )}

              {user.role === "admin" && (
                <Link
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-landing-profile-menu-item-text transition duration-150 hover:bg-landing-profile-menu-item-bg-hover hover:text-landing-profile-menu-item-text-hover"
                  href="/admin/polls"
                  onClick={() => setOpen(false)}
                >
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-landing-profile-icon-bg text-landing-profile-icon-text">
                    <svg fill="none" height="14" viewBox="0 0 14 14" width="14">
                      <rect height="5" rx="1" stroke="currentColor" strokeWidth="1.4" width="5" x="1" y="1" />
                      <rect height="5" rx="1" stroke="currentColor" strokeWidth="1.4" width="5" x="8" y="1" />
                      <rect height="5" rx="1" stroke="currentColor" strokeWidth="1.4" width="5" x="1" y="8" />
                      <rect height="5" rx="1" stroke="currentColor" strokeWidth="1.4" width="5" x="8" y="8" />
                    </svg>
                  </span>
                  Admin panel
                </Link>
              )}

              <button
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-landing-profile-menu-item-text transition duration-150 hover:bg-landing-profile-danger-bg-hover hover:text-landing-profile-danger-text disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isSigningOut}
                onClick={handleSignOut}
                type="button"
              >
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-landing-profile-danger-icon-bg text-landing-profile-danger-icon-text">
                  <svg fill="none" height="14" viewBox="0 0 14 14" width="14">
                    <path d="M5 2H2a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h3" stroke="currentColor" strokeLinecap="round" strokeWidth="1.4" />
                    <path d="M9.5 9.5 13 7l-3.5-2.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.4" />
                    <path d="M13 7H5" stroke="currentColor" strokeLinecap="round" strokeWidth="1.4" />
                  </svg>
                </span>
                {isSigningOut ? "Signing out..." : "Sign out"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function SignInNavButton() {
  return (
    <AppButtonLink
      href="/auth/sign-in"
      variant="secondary"
    >
      Sign in
    </AppButtonLink>
  );
}
