import { createClient } from "@/utils/supabase/server";

type LandingResultRow = {
  poll_id: string;
  option_breakdown:
    | Array<{
        optionId: string;
        votePercentage: number;
      }>
    | null;
};

export async function GET() {
  const supabase = await createClient();

  const [authResult, resultsResult] = await Promise.all([
    supabase.auth.getUser(),
    supabase.rpc("get_landing_poll_results"),
  ]);

  if (resultsResult.error) {
    return Response.json(
      { error: "Unable to load landing personalization." },
      { status: 500 },
    );
  }

  const resultRows =
    (resultsResult.data as LandingResultRow[] | null) ?? [];
  const pollIds = resultRows.map((row) => row.poll_id);
  const user = authResult.data.user;

  const voteResult =
    user && pollIds.length > 0
      ? await supabase
          .from("votes")
          .select("poll_id, option_id")
          .eq("user_id", user.id)
          .in("poll_id", pollIds)
      : { data: [], error: null };

  return Response.json(
    {
      results: resultRows.map((row) => ({
        pollId: row.poll_id,
        options: (row.option_breakdown ?? []).map((option) => ({
          optionId: option.optionId,
          votePercentage: Number(option.votePercentage ?? 0),
        })),
      })),
      votes: (voteResult.data ?? []).map((vote) => ({
        optionId: vote.option_id as string,
        pollId: vote.poll_id as string,
      })),
    },
    {
      headers: {
        "Cache-Control": "private, no-store",
      },
    },
  );
}
