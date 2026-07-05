import { FeedbackManagementClient } from "@/features/admin/components/feedback/feedback-management-client";
import type { AdminFeedbackRow } from "@/features/admin/types";
import { createClient } from "@/utils/supabase/server";

async function getFeedback(): Promise<{
  feedback: AdminFeedbackRow[];
  error: string | null;
}> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("feedback")
    .select(
      "id, user_id, user_email, category, message, status, internal_notes, resolved_at, resolved_by, created_at, updated_at",
    )
    .order("created_at", { ascending: false });

  if (error) {
    return {
      feedback: [],
      error:
        error.code === "42P01"
          ? "Feedback table is not ready. Run supabase/feedback.sql in Supabase first."
          : error.message,
    };
  }

  return {
    feedback: (data ?? []) as AdminFeedbackRow[],
    error: null,
  };
}

export default async function AdminFeedbackPage() {
  const { feedback, error } = await getFeedback();

  return (
    <div className="w-full min-w-0 space-y-6 p-6 sm:p-8 lg:p-10">
      <div>
        <h1 className="text-xl font-bold text-admin-text">Feedback</h1>
        <p className="mt-0.5 text-sm text-admin-text-muted">
          Review user feedback, assign status, and track resolution.
        </p>
      </div>

      <FeedbackManagementClient feedback={feedback} error={error} />
    </div>
  );
}
