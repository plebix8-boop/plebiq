"use server";

import { createClient } from "@/utils/supabase/server";
import { checkRateLimit } from "@/utils/rate-limit";

export type VoteOptionResult = {
  optionId: string;
  voteCount: number;
  votePercentage: number;
};

export type CastVoteSuccess = {
  votedOptionId: string;
  options: VoteOptionResult[];
};

export type CastVoteResult = CastVoteSuccess | { error: string };

export async function castVote(
  pollId: string,
  optionId: string,
): Promise<CastVoteResult> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: "You must be signed in to vote." };
    }

    const { limited } = await checkRateLimit("cast-vote", 10, 60_000, user.id);
    if (limited) {
      return { error: "You're voting too fast. Please wait a moment." };
    }

    const { data, error } = await supabase.rpc("cast_vote", {
      p_poll_id: pollId,
      p_option_id: optionId,
    });

    if (error) {
      return { error: error.message };
    }

    return data as CastVoteSuccess;
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Unable to record your vote.",
    };
  }
}
