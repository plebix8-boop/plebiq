import { VoteCampaignList } from "@/features/admin/components/seeding/vote-campaign-list";
import { VoteCampaignTask } from "@/features/admin/components/seeding/vote-campaign-task";
import type { VoteCampaignPoll, VoteCampaignSummary } from "@/features/admin/types";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

type CampaignLoadResult = {
  campaigns: VoteCampaignSummary[];
  usedSql: boolean;
  notice?: string;
};

async function getMockUserCount() {
  const adminSupabase = createAdminClient();
  let page = 1;
  const perPage = 200;
  let count = 0;

  while (true) {
    const { data, error } = await adminSupabase.auth.admin.listUsers({
      page,
      perPage,
    });

    if (error) {
      throw new Error(error.message);
    }

    const chunk = data.users ?? [];
    count += chunk.filter((user) => user.user_metadata?.is_mock === true).length;

    if (chunk.length < perPage) {
      break;
    }

    page += 1;
  }

  return count;
}

async function getPolls(): Promise<VoteCampaignPoll[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("polls")
    .select(
      `
        id,
        title,
        status,
        options:poll_options (
          id,
          label,
          description,
          vote_count,
          sort_order
        )
      `,
    )
    .order("sort_order", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return ((data as VoteCampaignPoll[] | null) ?? []).map((poll) => ({
    ...poll,
    options: [...poll.options].sort(
      (a, b) => ((a as { sort_order?: number | null }).sort_order ?? 0) - ((b as { sort_order?: number | null }).sort_order ?? 0),
    ),
  }));
}

async function getCampaignsWithFallback(): Promise<CampaignLoadResult> {
  const adminSupabase = createAdminClient();
  const { data, error } = await adminSupabase.rpc("get_vote_campaign_summaries");

  if (!error) {
    type VoteCampaignSummaryRow = {
      campaign_id: string;
      poll_id: string;
      poll_title: string;
      total_votes: number;
      created_at_start: string | null;
      created_at_end: string | null;
      option_breakdown:
        | Array<{
            optionId: string;
            label: string;
            count: number;
          }>
        | null;
    };

    return {
      campaigns: ((data as VoteCampaignSummaryRow[] | null) ?? []).map((row) => ({
        campaignId: row.campaign_id,
        pollId: row.poll_id,
        pollTitle: row.poll_title,
        totalVotes: Number(row.total_votes),
        createdAtStart: row.created_at_start,
        createdAtEnd: row.created_at_end,
        optionBreakdown: row.option_breakdown ?? [],
      })),
      usedSql: true,
    };
  }

  const votes: Array<{
    mock_campaign_id: string | null;
    poll_id: string;
    option_id: string;
    created_at: string | null;
    is_mock?: boolean | null;
    seed_source?: string | null;
  }> = [];
  let from = 0;
  const pageSize = 1000;

  while (true) {
    const { data: chunk, error: votesError } = await adminSupabase
      .from("votes")
      .select("mock_campaign_id,poll_id,option_id,created_at,is_mock,seed_source")
      .not("mock_campaign_id", "is", null)
      .eq("is_mock", true)
      .eq("seed_source", "admin-vote-campaign")
      .range(from, from + pageSize - 1);

    if (votesError) {
      throw new Error(votesError.message);
    }

    votes.push(...(chunk ?? []));

    if ((chunk ?? []).length < pageSize) {
      break;
    }

    from += pageSize;
  }

  if (!votes.length) {
    return {
      campaigns: [],
      usedSql: false,
      notice:
        "SQL campaign summaries are not installed yet. The page is using a temporary fallback reader.",
    };
  }

  const pollIds = [...new Set(votes.map((vote) => vote.poll_id))];
  const optionIds = [...new Set(votes.map((vote) => vote.option_id))];

  const [{ data: polls, error: pollsError }, { data: options, error: optionsError }] =
    await Promise.all([
      adminSupabase.from("polls").select("id,title").in("id", pollIds),
      adminSupabase.from("poll_options").select("id,label").in("id", optionIds),
    ]);

  if (pollsError) {
    throw new Error(pollsError.message);
  }

  if (optionsError) {
    throw new Error(optionsError.message);
  }

  const pollsById = new Map((polls ?? []).map((poll) => [poll.id, poll]));
  const optionsById = new Map((options ?? []).map((option) => [option.id, option]));
  const grouped = new Map<string, VoteCampaignSummary>();

  for (const vote of votes) {
    const campaignId =
      typeof vote.mock_campaign_id === "string" ? vote.mock_campaign_id : null;

    if (!campaignId) {
      continue;
    }

    const pollRecord = pollsById.get(vote.poll_id);
    const optionRecord = optionsById.get(vote.option_id);

    if (!pollRecord || !optionRecord) {
      continue;
    }

    const current = grouped.get(campaignId);

    if (!current) {
      grouped.set(campaignId, {
        campaignId,
        pollId: pollRecord.id,
        pollTitle: pollRecord.title,
        totalVotes: 1,
        createdAtStart: vote.created_at ?? null,
        createdAtEnd: vote.created_at ?? null,
        optionBreakdown: [
          {
            optionId: optionRecord.id,
            label: optionRecord.label,
            count: 1,
          },
        ],
      });
      continue;
    }

    current.totalVotes += 1;

    if (vote.created_at && (!current.createdAtStart || vote.created_at < current.createdAtStart)) {
      current.createdAtStart = vote.created_at;
    }

    if (vote.created_at && (!current.createdAtEnd || vote.created_at > current.createdAtEnd)) {
      current.createdAtEnd = vote.created_at;
    }

    const existingOption = current.optionBreakdown.find(
      (option) => option.optionId === optionRecord.id,
    );

    if (existingOption) {
      existingOption.count += 1;
    } else {
      current.optionBreakdown.push({
        optionId: optionRecord.id,
        label: optionRecord.label,
        count: 1,
      });
    }
  }

  return {
    campaigns: [...grouped.values()].sort((a, b) => {
      if (!a.createdAtEnd && !b.createdAtEnd) {
        return a.campaignId.localeCompare(b.campaignId);
      }

      if (!a.createdAtEnd) {
        return 1;
      }

      if (!b.createdAtEnd) {
        return -1;
      }

      return b.createdAtEnd.localeCompare(a.createdAtEnd);
    }),
    usedSql: false,
    notice:
      "SQL campaign summaries are not installed yet. The page is using a temporary fallback reader. Run supabase/vote-campaign-summaries.sql to switch to the scalable SQL path.",
  };
}

export default async function AdminVoteCampaignsPage() {
  const [polls, campaignResult, mockUserCount] = await Promise.all([
    getPolls(),
    getCampaignsWithFallback(),
    getMockUserCount(),
  ]);

  return (
    <div className="w-full min-w-0 space-y-6 p-6 sm:p-8 lg:p-10">
      <div>
        <h1 className="text-xl font-bold text-admin-text">Vote Campaigns</h1>
        <p className="mt-0.5 max-w-2xl text-sm text-admin-text-muted">
          Generate realistic mock voting activity using real polls, real vote rows,
          and mock user accounts only.
        </p>
      </div>

      {campaignResult.notice ? (
        <div className="rounded-[1.25rem] border border-amber-400/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
          {campaignResult.notice}
        </div>
      ) : null}

      <VoteCampaignTask polls={polls} mockUserCount={mockUserCount} />
      <VoteCampaignList campaigns={campaignResult.campaigns} />
    </div>
  );
}
