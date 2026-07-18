import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { SidebarProfileCard } from "@/features/admin/components/sidebar-profile-card";
import { SidebarNav } from "@/features/admin/components/sidebar-nav";
import { AdminMobileNav } from "@/features/admin/components/admin-mobile-nav";
import { ThemeLogo } from "@/components/theme-logo";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    redirect("/auth");
  }

  const role =
    typeof user.app_metadata.role === "string" ? user.app_metadata.role : "user";

  if (role !== "admin") {
    redirect("/");
  }

  const userName = typeof user.user_metadata.full_name === "string" ? user.user_metadata.full_name : null;

  return (
    <div className="flex h-screen overflow-hidden bg-admin-shell-bg text-admin-text">
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="decorative-blur absolute -left-40 -top-40 h-[520px] w-[520px] rounded-full bg-purple-700/20 blur-[130px]" />
        <div className="decorative-blur absolute -bottom-40 -right-40 h-[440px] w-[440px] rounded-full bg-blue-700/20 blur-[120px]" />
      </div>

      {/* Sidebar — desktop only */}
      <aside className="relative z-10 hidden h-screen w-[260px] shrink-0 flex-col overflow-y-auto border-r border-admin-divider bg-admin-sidebar-bg md:flex">
        <div className="border-b border-admin-divider px-5 py-4">
          <ThemeLogo
            alt="Plebiq"
            width={1266}
            height={435}
            className="h-9 w-auto"
            priority
          />
          <p className="text-[10px] uppercase tracking-widest text-admin-text-subtle">Admin</p>
        </div>
        <SidebarNav />
        <div className="flex-1" />
        <SidebarProfileCard
          email={user.email!}
          name={userName}
          role={role}
        />
      </aside>

      {/* Right column: mobile topbar + content */}
      <div className="relative z-10 flex flex-1 flex-col overflow-hidden">
        <AdminMobileNav email={user.email!} name={userName} role={role} />
        <main className="flex-1 min-w-0 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
