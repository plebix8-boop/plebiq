export const feedbackCategories = [
  "suggestion",
  "bug_report",
  "feature_request",
  "general",
] as const;

export const feedbackStatuses = [
  "new",
  "under_review",
  "in_discussion",
  "planned",
  "in_progress",
  "implemented",
  "declined",
  "duplicate",
] as const;

export type FeedbackCategory = (typeof feedbackCategories)[number];
export type FeedbackStatus = (typeof feedbackStatuses)[number];

export type FeedbackActionState = {
  error?: string;
  success?: string;
};

export const feedbackCategoryLabels: Record<FeedbackCategory, string> = {
  suggestion: "Suggestion",
  bug_report: "Bug Report",
  feature_request: "Feature Request",
  general: "General",
};

export const feedbackStatusLabels: Record<FeedbackStatus, string> = {
  new: "New",
  under_review: "Under Review",
  in_discussion: "In Discussion",
  planned: "Planned",
  in_progress: "In Progress",
  implemented: "Implemented",
  declined: "Declined",
  duplicate: "Duplicate",
};
