export const summaryCards = [
  { label: "Total Users", value: "12,480", change: "+8.2%", changeLabel: "vs last week", icon: "users" },
  { label: "New Users Today", value: "47", change: "+12", changeLabel: "vs yesterday", icon: "user-plus" },
  { label: "Active Polls", value: "6", change: "2 closing soon", changeLabel: "", icon: "poll" },
  { label: "Total Votes", value: "91,240", change: "+12.5%", changeLabel: "vs last week", icon: "vote" },
  { label: "Total Views", value: "209,500", change: "+9.1%", changeLabel: "vs last week", icon: "eye" },
  { label: "Conversion Rate", value: "43.6%", change: "+1.4%", changeLabel: "vs last week", icon: "trend" },
];

export type HealthStatus =
  | "High Engagement"
  | "Low Engagement"
  | "Needs Promotion"
  | "Low Conversion"
  | "Voting Slowed Down"
  | "Very Competitive"
  | "One-sided";

export type Poll = {
  id: string;
  title: string;
  category: string;
  status: "Live" | "Draft" | "Closed";
  votes: number;
  views: number;
  lastVote: string;
  health: HealthStatus;
};

export const activePolls: Poll[] = [
  { id: "1", title: "Should social media be regulated?", category: "Politics", status: "Live", votes: 18420, views: 42000, lastVote: "2 min ago", health: "High Engagement" },
  { id: "2", title: "Best programming language in 2025?", category: "Technology", status: "Live", votes: 15200, views: 28000, lastVote: "8 min ago", health: "High Engagement" },
  { id: "3", title: "Is remote work better than office?", category: "Work", status: "Live", votes: 12800, views: 45000, lastVote: "1 hr ago", health: "Low Conversion" },
  { id: "4", title: "Who will win the Champions League?", category: "Sports", status: "Live", votes: 22100, views: 38000, lastVote: "5 min ago", health: "Very Competitive" },
  { id: "5", title: "Should college education be free?", category: "Education", status: "Live", votes: 8900, views: 31000, lastVote: "3 hrs ago", health: "Needs Promotion" },
  { id: "6", title: "Best diet trend of 2025?", category: "Health", status: "Live", votes: 13820, views: 25500, lastVote: "45 min ago", health: "Voting Slowed Down" },
];

export const votesOverTime: Record<string, { date: string; votes: number }[]> = {
  today: [
    { date: "12am", votes: 120 }, { date: "3am", votes: 80 }, { date: "6am", votes: 340 },
    { date: "9am", votes: 820 }, { date: "12pm", votes: 1400 }, { date: "3pm", votes: 1900 },
    { date: "6pm", votes: 2300 }, { date: "9pm", votes: 1750 },
  ],
  "7d": [
    { date: "Apr 29", votes: 4200 }, { date: "Apr 30", votes: 3800 }, { date: "May 1", votes: 5100 },
    { date: "May 2", votes: 6300 }, { date: "May 3", votes: 5700 }, { date: "May 4", votes: 7200 },
    { date: "May 5", votes: 8100 },
  ],
  "30d": [
    { date: "Apr 6", votes: 2100 }, { date: "Apr 9", votes: 2800 }, { date: "Apr 12", votes: 3200 },
    { date: "Apr 15", votes: 4100 }, { date: "Apr 18", votes: 3700 }, { date: "Apr 21", votes: 5200 },
    { date: "Apr 24", votes: 6100 }, { date: "Apr 27", votes: 7400 }, { date: "Apr 30", votes: 6800 },
    { date: "May 3", votes: 8100 },
  ],
  month: [
    { date: "May 1", votes: 5100 }, { date: "May 2", votes: 6300 }, { date: "May 3", votes: 5700 },
    { date: "May 4", votes: 7200 }, { date: "May 5", votes: 8100 },
  ],
};

export const userGrowthData: Record<string, { date: string; users: number }[]> = {
  "7d": [
    { date: "Apr 29", users: 38 }, { date: "Apr 30", users: 42 }, { date: "May 1", users: 35 },
    { date: "May 2", users: 51 }, { date: "May 3", users: 49 }, { date: "May 4", users: 60 },
    { date: "May 5", users: 47 },
  ],
  "30d": [
    { date: "Apr 6", users: 28 }, { date: "Apr 8", users: 34 }, { date: "Apr 10", users: 29 },
    { date: "Apr 12", users: 41 }, { date: "Apr 14", users: 38 }, { date: "Apr 16", users: 52 },
    { date: "Apr 18", users: 45 }, { date: "Apr 20", users: 60 }, { date: "Apr 22", users: 55 },
    { date: "Apr 24", users: 63 }, { date: "Apr 26", users: 71 }, { date: "Apr 28", users: 58 },
    { date: "Apr 30", users: 80 }, { date: "May 2", users: 74 }, { date: "May 4", users: 47 },
  ],
  month: [
    { date: "May 1", users: 40 }, { date: "May 2", users: 55 }, { date: "May 3", users: 49 },
    { date: "May 4", users: 60 }, { date: "May 5", users: 47 },
  ],
  year: [
    { date: "Jan", users: 210 }, { date: "Feb", users: 340 }, { date: "Mar", users: 480 },
    { date: "Apr", users: 620 }, { date: "May", users: 190 },
  ],
};

export const usersByCountry = [
  { country: "Pakistan", users: 8500 },
  { country: "India", users: 5200 },
  { country: "USA", users: 3100 },
  { country: "UAE", users: 1400 },
  { country: "UK", users: 900 },
  { country: "Bangladesh", users: 700 },
];

export const votesByCountry = [
  { country: "Pakistan", votes: 31200 },
  { country: "India", votes: 22400 },
  { country: "USA", votes: 18600 },
  { country: "UAE", votes: 9800 },
  { country: "UK", votes: 5400 },
  { country: "Bangladesh", votes: 3840 },
];

export const loginProviders = [
  { name: "Google", value: 68, fill: "var(--provider-google)" },
  { name: "Facebook", value: 32, fill: "var(--provider-facebook)" },
];

export const recentActivity = [
  { id: "1", icon: "join", text: "Ahmed joined from Pakistan", sub: "via Google · 2 min ago" },
  { id: "2", icon: "vote", text: 'Sara voted on "Should social media be regulated?"', sub: "via Facebook · 5 min ago" },
  { id: "3", icon: "join", text: "James joined from USA", sub: "via Google · 11 min ago" },
  { id: "4", icon: "vote", text: 'Riya voted on "Best programming language in 2025?"', sub: "via Google · 18 min ago" },
  { id: "5", icon: "status", text: 'Poll "Is climate change urgent?" closed', sub: "by Admin · 1 hr ago" },
  { id: "6", icon: "join", text: "Omar joined from UAE", sub: "via Google · 1 hr ago" },
  { id: "7", icon: "vote", text: 'Liu voted on "Who will win the Champions League?"', sub: "via Google · 2 hrs ago" },
  { id: "8", icon: "status", text: 'Poll "Best diet trend of 2025?" set to Live', sub: "by Admin · 3 hrs ago" },
];
