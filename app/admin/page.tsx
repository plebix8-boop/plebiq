export default async function AdminRoute() {
  const { redirect } = await import("next/navigation");
  redirect("/admin/polls");
}
