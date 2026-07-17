import { UserManagementClient } from "@/features/admin/components/users/user-management-client";
import type { AdminUserRecord } from "@/features/admin/types";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

async function getUsers(): Promise<AdminUserRecord[]> {
  const adminSupabase = createAdminClient();
  const users: AdminUserRecord[] = [];
  let page = 1;
  const perPage = 200;

  while (true) {
    const { data, error } = await adminSupabase.auth.admin.listUsers({
      page,
      perPage,
    });

    if (error) throw new Error(error.message);

    for (const user of data.users ?? []) {
      const name =
        typeof user.user_metadata.full_name === "string"
          ? user.user_metadata.full_name
          : typeof user.user_metadata.name === "string"
            ? user.user_metadata.name
            : null;
      const country =
        typeof user.user_metadata.country === "string"
          ? user.user_metadata.country
          : null;
      const provider =
        typeof user.app_metadata.provider === "string"
          ? user.app_metadata.provider
          : "email";

      users.push({
        country,
        createdAt: user.created_at,
        email: user.email ?? "No email",
        id: user.id,
        lastSignInAt: user.last_sign_in_at ?? null,
        name,
        provider,
        role: user.app_metadata.role === "admin" ? "admin" : "user",
      });
    }

    if ((data.users ?? []).length < perPage) break;
    page += 1;
  }

  return users.sort((a, b) => {
    if (a.role !== b.role) return a.role === "admin" ? -1 : 1;
    return a.email.localeCompare(b.email);
  });
}

export default async function AdminUsersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const users = await getUsers();

  return (
    <div className="w-full min-w-0 space-y-6 p-6 sm:p-8 lg:p-10">
      <div>
        <h1 className="text-xl font-bold text-admin-text">User Management</h1>
        <p className="mt-1 max-w-2xl text-sm text-admin-text-muted">
          Review accounts and control who can access administrative tools.
        </p>
      </div>
      <UserManagementClient currentUserId={user?.id ?? ""} users={users} />
    </div>
  );
}
