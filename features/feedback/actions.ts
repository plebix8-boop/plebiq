"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import {
  feedbackCategories,
  type FeedbackActionState,
  type FeedbackCategory,
} from "./types";

function normalizeText(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function isFeedbackCategory(value: string): value is FeedbackCategory {
  return feedbackCategories.includes(value as FeedbackCategory);
}

function startOfUtcDay(date: Date) {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  ).toISOString();
}

export async function submitFeedback(
  _previousState: FeedbackActionState,
  formData: FormData,
): Promise<FeedbackActionState> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.id || !user.email) {
      return { error: "Sign in to send feedback." };
    }

    const category = normalizeText(formData.get("category"));
    const message = normalizeText(formData.get("message"));

    if (!isFeedbackCategory(category)) {
      return { error: "Choose a valid feedback category." };
    }

    if (message.length < 10) {
      return { error: "Feedback message must be at least 10 characters." };
    }

    const todayStart = startOfUtcDay(new Date());
    const { count, error: countError } = await supabase
      .from("feedback")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("created_at", todayStart);

    if (countError) {
      return { error: countError.message };
    }

    if ((count ?? 0) >= 5) {
      return { error: "You have reached the daily feedback limit." };
    }

    const { error } = await supabase.from("feedback").insert({
      user_id: user.id,
      user_email: user.email,
      category,
      message,
    });

    if (error) {
      return { error: error.message };
    }

    revalidatePath("/admin/feedback");
    return { success: "Thanks. Your feedback was sent." };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Unable to submit feedback.",
    };
  }
}
