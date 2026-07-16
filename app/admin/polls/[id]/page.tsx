import { notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { PollDetailView } from "@/features/admin/components/poll-detail/poll-detail-view";
import type { AdminPoll, AdminPollCountryTraffic } from "@/features/admin/types";

export default async function PollDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: poll } = await supabase
    .from("polls")
    .select(
      `
        id, title, description, status, is_featured, is_pinned, sort_order,
        image_url, expires_at, closed_at, view_count, created_at, updated_at, created_by,
        category:categories (id, name, slug),
        options:poll_options (id, label, description, sort_order, vote_count, created_at)
      `,
    )
    .eq("id", id)
    .single();

  const { data: countryTraffic } = await supabase.rpc(
    "get_admin_poll_country_traffic",
    { p_poll_id: id },
  );

  if (!poll) notFound();

  const normalized: AdminPoll = {
    ...(poll as unknown as AdminPoll),
    category: Array.isArray(poll.category)
      ? (poll.category[0] ?? null)
      : (poll.category as AdminPoll["category"]),
    options: [...(poll.options as AdminPoll["options"])].sort(
      (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0),
    ),
  };

  return (
    <PollDetailView
      countryTraffic={(countryTraffic ?? []) as AdminPollCountryTraffic[]}
      poll={normalized}
    />
  );
}
