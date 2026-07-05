"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { SignOutButton } from "@/features/auth/components/sign-out-button";

const navItems = [
  {
    href: "/admin/polls",
    label: "Polls",
  },
];

type AdminSidebarProps = {
  email: string;
  name?: string | null;
  role: string;
};

export function AdminSidebar({ email, name, role }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="relative flex h-screen flex-col overflow-y-auto border-r border-white/10 bg-surface/92 p-6 backdrop-blur-xl lg:fixed lg:inset-y-0 lg:left-0 lg:w-[260px]">
      <div className="mb-10 flex items-center gap-3">
        <div>
          <Image
            alt="Plebiq"
            src="/logo.png"
            width={1266}
            height={435}
            className="h-10 w-auto"
            priority
          />
          <p className="text-xs uppercase tracking-[0.28em] text-white/40">
            Admin
          </p>
        </div>
      </div>

      <div className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-white/35">
        Main Menu
      </div>

      <nav className="grid gap-2">
        {navItems.map((item) => {
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${
                active
                  ? "bg-white/12 text-white shadow-[inset_0_1px_0_var(--fg-6)]"
                  : "text-white/55 hover:bg-white/6 hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto space-y-4">
        <div className="text-xs font-semibold uppercase tracking-[0.25em] text-white/35">
          Profile
        </div>
        <div className="rounded-[1.25rem] border border-white/10 bg-white/5 p-4 shadow-[0_20px_40px_var(--shadow-soft)]">
          <div className="flex items-start gap-3">
            <div className="grid size-11 place-items-center rounded-full bg-[linear-gradient(135deg,_var(--danger),_var(--accent))] text-sm font-semibold text-white">
              {(name || email).slice(0, 1).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">
                {name || "Admin user"}
              </p>
              <p className="mt-1 truncate text-sm text-white/45">{email}</p>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between gap-3">
            <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">
              {role}
            </span>
            <SignOutButton />
          </div>
        </div>
      </div>
    </aside>
  );
}
