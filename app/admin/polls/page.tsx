import { AdminDashboardClient } from "@/features/admin/components/dashboard/admin-dashboard-client";

export default function AdminPollsRoute() {
  return (
    <div className="w-full min-w-0 space-y-6 p-6 sm:p-8 lg:p-10">
      <div>
        <h1 className="text-xl font-bold text-admin-text">Dashboard</h1>
        <p className="mt-0.5 text-sm text-admin-text-muted">
          Platform overview and engagement metrics
        </p>
      </div>

      <AdminDashboardClient />
    </div>
  );
}
