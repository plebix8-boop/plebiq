import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export default async function DashboardRoute() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  const role = typeof user.app_metadata?.role === "string" ? user.app_metadata.role : "user";
  redirect(role === "admin" ? "/admin/polls" : "/");
}
