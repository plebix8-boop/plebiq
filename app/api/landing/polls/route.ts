import { createClient } from "@/utils/supabase/server";

type LandingPollRow = {
  poll_id: string;
  title: string;
  description: string | null;
  status: string;
  category_name: string | null;
  category_slug: string | null;
  is_featured: boolean | null;
  is_pinned: boolean | null;
  sort_order: number | null;
  image_url: string | null;
  view_count: number | null;
  total_votes: number;
  option_breakdown:
    | Array<{
        optionId: string;
        label: string;
        description: string;
        sortOrder: number | null;
        voteCount: number;
        votePercentage: number;
      }>
    | null;
};

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase.rpc("get_landing_poll_results");

  if (error) {
    return Response.json(
      {
        error:
          "Unable to load landing poll results. Run supabase/landing-poll-results.sql in Supabase SQL Editor first.",
      },
      { status: 500 },
    );
  }

  const polls = ((data as LandingPollRow[] | null) ?? []).map((row) => ({
    id: row.poll_id,
    title: row.title,
    description: row.description ?? "",
    status: row.status,
    category: {
      name: row.category_name ?? "Uncategorized",
      slug: row.category_slug ?? "uncategorized",
    },
    isFeatured: Boolean(row.is_featured),
    isPinned: Boolean(row.is_pinned),
    sortOrder: row.sort_order,
    imageUrl: row.image_url,
    viewCount: row.view_count ?? 0,
    totalVotes: Number(row.total_votes ?? 0),
    options: (row.option_breakdown ?? []).map((option) => ({
      id: option.optionId,
      label: option.label,
      description: option.description,
      sortOrder: option.sortOrder,
      voteCount: Number(option.voteCount ?? 0),
      votePercentage: Number(option.votePercentage ?? 0),
    })),
  }));

  return Response.json({
    authenticated: Boolean(user),
    polls,
  });
}
