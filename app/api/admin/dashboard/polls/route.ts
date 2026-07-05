import { getAdminDashboardPolls } from "@/features/admin/lib/dashboard-polls";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
      return Response.json({ error: "Authentication required." }, { status: 401 });
    }

    const role =
      typeof user.app_metadata.role === "string" ? user.app_metadata.role : "user";

    if (role !== "admin") {
      return Response.json({ error: "Admin access required." }, { status: 403 });
    }

    const result = await getAdminDashboardPolls();

    return Response.json(result);
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to load admin dashboard polls.",
      },
      { status: 500 },
    );
  }
}
