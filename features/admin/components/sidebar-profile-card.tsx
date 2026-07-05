"use client";

import { ThemeSwitcher } from "@/components/theme-switcher";
import { ClientSignOutButton } from "@/features/auth/components/client-sign-out-button";

type SidebarProfileCardProps = {
  name: string | null;
  email: string;
  role: string;
};

export function SidebarProfileCard({ name, email, role }: SidebarProfileCardProps) {
  const initials = name
    ? name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : email[0].toUpperCase();

  const displayName = name ?? email.split("@")[0];

  return (
    <div className="space-y-3 border-t border-admin-divider p-4">
      <ThemeSwitcher />
      <div className="flex items-center gap-3 rounded-xl border border-admin-card-border bg-admin-profile-bg p-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-admin-button-primary-bg to-admin-profile-role-bg text-xs font-bold text-admin-button-primary-text">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-admin-profile-text">{displayName}</p>
          <p className="truncate text-xs text-admin-profile-muted">{email}</p>
          <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-admin-profile-role-text">
            {role}
          </p>
        </div>
        <ClientSignOutButton className="flex size-7 items-center justify-center rounded-lg text-admin-profile-muted transition hover:bg-admin-button-secondary-bg-hover hover:text-admin-profile-text disabled:cursor-not-allowed disabled:opacity-60">
          <svg xmlns="http://www.w3.org/2000/svg" className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </ClientSignOutButton>
      </div>
    </div>
  );
}
