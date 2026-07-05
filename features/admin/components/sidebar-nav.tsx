"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 20V10" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 20V4" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 20v-6" />
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
];

export function SidebarNav() {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-1 p-3">
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
  );
}
