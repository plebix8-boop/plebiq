"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { ClientSignOutButton } from "@/features/auth/components/client-sign-out-button";
import { ThemeLogo } from "@/components/theme-logo";

const navItems = [
  {
    label: "Dashboard",
    href: "/admin/polls",
    icon: (
      <svg className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    label: "Poll Management",
    href: "/admin/management",
    icon: (
      <svg className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
        <rect x="9" y="3" width="6" height="4" rx="1" />
        <path strokeLinecap="round" d="M9 12h6M9 16h4" />
      </svg>
    ),
  },
  {
    label: "User Management",
    href: "/admin/users",
    icon: (
      <svg className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" strokeLinecap="round" />
        <circle cx="9" cy="7" r="4" />
        <path d="M19 8v6M22 11h-6" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: "Data Seeding Tasks",
    href: "/admin/seeding-tasks",
    icon: (
      <svg className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <ellipse cx="12" cy="5" rx="7" ry="3" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 5v6c0 1.66 3.13 3 7 3s7-1.34 7-3V5" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 11v6c0 1.66 3.13 3 7 3s7-1.34 7-3v-6" />
      </svg>
    ),
  },
  {
    label: "Vote Campaigns",
    href: "/admin/vote-campaigns",
    icon: (
      <svg className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 20V10M18 20V4M6 20v-6" />
      </svg>
    ),
  },
  {
    label: "Feedback",
    href: "/admin/feedback",
    icon: (
      <svg className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a8 8 0 0 1-8 8H7l-4 3v-7a8 8 0 1 1 18-4Z" />
        <path strokeLinecap="round" d="M8 10h8M8 14h5" />
      </svg>
    ),
  },
  {
    label: "Landing Page",
    href: "/",
    icon: (
      <svg className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 11.5 12 4l9 7.5" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M5.5 10.5V20h13v-9.5" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.5 20v-5h5v5" />
      </svg>
    ),
  },
];

type AdminMobileNavProps = {
  email: string;
  name: string | null;
  role: string;
};

export function AdminMobileNav({ email, name, role }: AdminMobileNavProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return undefined;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const initials = name
    ? name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : email[0].toUpperCase();
  const displayName = name ?? email.split("@")[0];

  return (
    <>
      {/* Top navbar */}
      <header className="flex shrink-0 items-center justify-between border-b border-admin-divider bg-admin-sidebar-bg/95 px-4 py-3 backdrop-blur-md md:hidden">
        <div className="flex items-center gap-2">
          <ThemeLogo
            alt="Plebiq"
            width={1266}
            height={435}
            className="h-7 w-auto"
            priority
          />
          <p className="text-[10px] uppercase tracking-widest text-admin-text-subtle">Admin</p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          className="flex size-9 items-center justify-center rounded-xl border border-admin-button-secondary-border bg-admin-button-secondary-bg text-admin-button-secondary-text transition hover:bg-admin-button-secondary-bg-hover hover:text-admin-text"
        >
          <svg className="size-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </header>

      {/* Backdrop */}
      <div
        onClick={() => setOpen(false)}
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col border-r border-admin-card-border bg-admin-sidebar-bg transition-transform duration-300 ease-in-out md:hidden ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Drawer header */}
        <div className="flex shrink-0 items-center justify-between border-b border-admin-divider px-5 py-4">
          <div>
            <ThemeLogo
              alt="Plebiq"
              width={1266}
              height={435}
              className="h-8 w-auto"
              priority
            />
            <p className="text-[10px] uppercase tracking-widest text-admin-text-subtle">Admin</p>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="flex size-8 items-center justify-center rounded-lg text-admin-text-muted transition hover:bg-admin-button-secondary-bg-hover hover:text-admin-text"
          >
            <svg className="size-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-admin-nav-active-bg text-admin-nav-active-text"
                    : "text-admin-nav-idle-text hover:bg-admin-nav-hover-bg hover:text-admin-nav-hover-text"
                }`}
              >
                <span className={active ? "text-admin-nav-active-text" : ""}>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Profile card */}
        <div className="shrink-0 space-y-3 border-t border-admin-divider p-4">
          <ThemeSwitcher />
          <div className="flex items-center gap-3 rounded-xl border border-admin-card-border bg-admin-profile-bg p-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-admin-button-primary-bg to-admin-profile-role-bg text-xs font-bold text-admin-button-primary-text">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-admin-profile-text">{displayName}</p>
              <p className="truncate text-xs text-admin-profile-muted">{email}</p>
              <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-admin-profile-role-text">{role}</p>
            </div>
            <ClientSignOutButton className="flex size-7 items-center justify-center rounded-lg text-admin-profile-muted transition hover:bg-admin-button-secondary-bg-hover hover:text-admin-profile-text disabled:cursor-not-allowed disabled:opacity-60">
              <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </ClientSignOutButton>
          </div>
        </div>
      </div>
    </>
  );
}
