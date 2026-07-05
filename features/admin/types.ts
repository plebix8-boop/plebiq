export type AdminActionState = {
  error?: string;
  success?: string;
};

export type CategoryActionState = {
  error?: string;
  success?: string;
  category?: AdminCategory;
  deletedCategoryId?: string;
};

export type MockUserSeedState = {
  error?: string;
  success?: string;
  batchId?: string;
  createdCount?: number;
  failedCount?: number;
  startAt?: string;
  endAt?: string;
};

export type MockUserBatchSummary = {
  batchId: string;
  userCount: number;
  seededStartAt: string | null;
  seededEndAt: string | null;
  batchCreatedAt: string | null;
};

export type VoteCampaignState = {
  error?: string;
  success?: string;
  campaignId?: string;
  createdCount?: number;
  pollTitle?: string;
};

export type VoteCampaignPoll = {
  id: string;
  title: string;
  status: "draft" | "live" | "closed";
  options: {
    id: string;
    label: string;
    description: string;
    vote_count: number | null;
  }[];
};

export type VoteCampaignSummary = {
  campaignId: string;
  pollId: string;
  pollTitle: string;
  totalVotes: number;
  createdAtStart: string | null;
  createdAtEnd: string | null;
  optionBreakdown: {
    optionId: string;
    label: string;
    count: number;
  }[];
};

export type AdminDashboardOverview = {
  totalUsers: number;
  usersAddedLast7d: number;
  usersAddedPrevious7d: number;
  newUsersToday: number;
  newUsersYesterday: number;
  activePolls: number;
  closingSoonPolls: number;
  totalVotes: number;
  votesLast7d: number;
  votesPrevious7d: number;
};

export type AdminDashboardSummaryCard = {
  label: string;
  value: string;
  change?: string;
  changeLabel?: string;
  icon: "users" | "user-plus" | "poll" | "vote";
};

export type AdminDashboardHealthStatus =
  | "High Engagement"
  | "Low Engagement"
  | "Needs Promotion"
  | "Low Conversion"
  | "Voting Slowed Down"
  | "Very Competitive"
  | "One-sided";

export type AdminDashboardPollRow = {
  id: string;
  title: string;
  category: string;
  status: "Live" | "Draft" | "Closed";
  votes: number;
  lastVoteAt: string | null;
  health: AdminDashboardHealthStatus;
};

export type AdminDashboardAttentionPoll = AdminDashboardPollRow & {
  tip: string;
};

export type AdminDashboardPolls = {
  performance: AdminDashboardPollRow[];
  attention: AdminDashboardAttentionPoll[];
};

export type AdminDashboardTrendPoint = {
  date: string;
  value: number;
};

export type AdminDashboardTrends = {
  votesOverTime: Record<string, AdminDashboardTrendPoint[]>;
  userGrowth: Record<string, AdminDashboardTrendPoint[]>;
};

export type AdminDashboardCountryMetric = {
  country: string;
  value: number;
};

export type AdminDashboardLoginProviderMetric = {
  name: string;
  value: number;
  fill: string;
};

export type AdminDashboardAudience = {
  usersByCountry: AdminDashboardCountryMetric[];
  votesByCountry: AdminDashboardCountryMetric[];
  loginProviders: AdminDashboardLoginProviderMetric[];
};

export type AdminDashboardRecentActivityItem = {
  id: string;
  icon: "join" | "vote" | "status";
  text: string;
  sub: string;
};

export type AdminCategory = {
  id: string;
  name: string;
  slug: string;
  created_at: string;
};

export type AdminPollOption = {
  id: string;
  label: string;
  description: string;
  sort_order: number | null;
  vote_count: number | null;
};

export type AdminPoll = {
  id: string;
  title: string;
  description: string | null;
  status: "draft" | "live" | "closed";
  is_featured: boolean | null;
  is_pinned: boolean | null;
  sort_order: number | null;
  image_url: string | null;
  expires_at: string | null;
  closed_at: string | null;
  view_count: number | null;
  created_at: string;
  updated_at: string;
  created_by: string;
  category: {
    id: string;
    name: string;
    slug: string;
  } | null;
  options: AdminPollOption[];
};

export type AdminSchemaStatus = {
  ready: boolean;
  message?: string;
};

export type AdminFeedbackCategory =
  | "suggestion"
  | "bug_report"
  | "feature_request"
  | "general";

export type AdminFeedbackStatus =
  | "new"
  | "under_review"
  | "in_discussion"
  | "planned"
  | "in_progress"
  | "implemented"
  | "declined"
  | "duplicate";

export type AdminFeedbackRow = {
  id: string;
  user_id: string;
  user_email: string;
  category: AdminFeedbackCategory;
  message: string;
  status: AdminFeedbackStatus;
  internal_notes: string | null;
  resolved_at: string | null;
  resolved_by: string | null;
  created_at: string;
  updated_at: string;
};
