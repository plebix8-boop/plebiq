export type PollOption = {
  id?: string;
  label: string;
  description: string;
  accent: string;
  previewWidth: string;
};

export type FeaturedPoll = {
  id?: string;
  tag: string;
  category: string;
  image: string;
  question: string;
  description: string;
  options: PollOption[];
};

export type HeroPhrase = {
  text: string;
  highlight: string[];
};

export type LiveVoteUser = {
  name: string;
  code: string;
};

export const featuredPoll: FeaturedPoll = {
  tag: "Featured live poll",
  category: "Product",
  image:
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1600&auto=format&fit=crop",
  question: "Which product decision should the team validate first?",
  description:
    "Help the team choose which feature deserves validation first. Your response stays private until you vote, then live results unlock.",
  options: [
    {
      label: "One-click sharing",
      description: "Make polls easy to send across team and customer channels.",
      accent: "from-sky-300 to-cyan-400",
      previewWidth: "46%",
    },
    {
      label: "Audience segments",
      description: "Compare answers by group, region, or respondent type.",
      accent: "from-violet-300 to-fuchsia-400",
      previewWidth: "32%",
    },
    {
      label: "Result exports",
      description: "Turn live results into clean reports your team can use.",
      accent: "from-amber-200 to-orange-400",
      previewWidth: "22%",
    },
  ],
};

export const feedCategories = ["All", "Product", "Culture", "Tech", "World"];

export const feedPolls: FeaturedPoll[] = [
  featuredPoll,
  {
    tag: "Community pulse",
    category: "Culture",
    image:
      "https://images.unsplash.com/photo-1511632765486-a01980e01a18?q=80&w=1600&auto=format&fit=crop",
    question: "What makes an online community worth returning to?",
    description:
      "Help compare the signals that make digital spaces feel active, safe, and worth joining again.",
    options: [
      {
        label: "Thoughtful moderation",
        description: "Clear standards and fast action when conversations drift.",
        accent: "from-emerald-300 to-cyan-400",
        previewWidth: "38%",
      },
      {
        label: "Useful discussions",
        description: "Threads that help people learn, decide, or solve problems.",
        accent: "from-violet-300 to-fuchsia-400",
        previewWidth: "35%",
      },
      {
        label: "Member recognition",
        description: "Visible appreciation for people who add real value.",
        accent: "from-amber-200 to-orange-400",
        previewWidth: "27%",
      },
    ],
  },
  {
    tag: "Tech decision",
    category: "Tech",
    image:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1600&auto=format&fit=crop",
    question: "Which AI workflow should teams automate first?",
    description:
      "Pick the workflow where automation would save the most time without lowering quality.",
    options: [
      {
        label: "Research summaries",
        description: "Condense long sources into useful briefs for teams.",
        accent: "from-sky-300 to-cyan-400",
        previewWidth: "44%",
      },
      {
        label: "Customer triage",
        description: "Route issues, detect urgency, and prepare next actions.",
        accent: "from-violet-300 to-fuchsia-400",
        previewWidth: "34%",
      },
      {
        label: "Report drafting",
        description: "Turn structured notes into polished team updates.",
        accent: "from-amber-200 to-orange-400",
        previewWidth: "22%",
      },
    ],
  },
  {
    tag: "World poll",
    category: "World",
    image:
      "https://images.unsplash.com/photo-1521295121783-8a321d551ad2?q=80&w=1600&auto=format&fit=crop",
    question: "What should global leaders prioritize this year?",
    description:
      "Choose the issue you think deserves the strongest coordinated attention across countries.",
    options: [
      {
        label: "Climate resilience",
        description: "Prepare cities, food systems, and communities for shocks.",
        accent: "from-emerald-300 to-cyan-400",
        previewWidth: "41%",
      },
      {
        label: "Conflict reduction",
        description: "Support diplomacy and reduce harm in active conflicts.",
        accent: "from-violet-300 to-fuchsia-400",
        previewWidth: "33%",
      },
      {
        label: "Digital safety",
        description: "Protect people from scams, surveillance, and abuse.",
        accent: "from-amber-200 to-orange-400",
        previewWidth: "26%",
      },
    ],
  },
  {
    tag: "Product research",
    category: "Product",
    image:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=1600&auto=format&fit=crop",
    question: "Which research signal should product teams trust most?",
    description:
      "Compare the inputs teams use when deciding what deserves roadmap space.",
    options: [
      {
        label: "User interviews",
        description: "Direct context from people with real workflows.",
        accent: "from-sky-300 to-cyan-400",
        previewWidth: "40%",
      },
      {
        label: "Usage analytics",
        description: "Behavior patterns captured across the product.",
        accent: "from-violet-300 to-fuchsia-400",
        previewWidth: "37%",
      },
      {
        label: "Support tickets",
        description: "Repeated pain points from frustrated users.",
        accent: "from-amber-200 to-orange-400",
        previewWidth: "23%",
      },
    ],
  },
];

export const heroPhrases: HeroPhrase[] = [
  {
    text: "If you stay quiet, others will decide.",
    highlight: ["quiet", "decide"],
  },
  {
    text: "Your vote can shift what happens next.",
    highlight: ["vote", "shift"],
  },
  {
    text: "Speak now and help shape tomorrow.",
    highlight: ["speak", "shape"],
  },
  {
    text: "One opinion can shift the whole room.",
    highlight: ["opinion", "shift"],
  },
  {
    text: "Every answer adds weight to change.",
    highlight: ["answer", "change"],
  },
];

export const liveVoteUsers: LiveVoteUser[] = [
  { name: "Ali", code: "pk" },
  { name: "Emma", code: "gb" },
  { name: "Noah", code: "us" },
  { name: "Ava", code: "ca" },
  { name: "Liam", code: "de" },
  { name: "Sophia", code: "fr" },
  { name: "Zara", code: "ae" },
  { name: "Omar", code: "in" },

  { name: "Ethan", code: "au" },
  { name: "Mia", code: "it" },
  { name: "Lucas", code: "es" },
  { name: "Amelia", code: "nl" },
  { name: "Yusuf", code: "sa" },
  { name: "Hassan", code: "eg" },
  { name: "Isabella", code: "br" },
  { name: "Daniel", code: "mx" },

  { name: "Olivia", code: "se" },
  { name: "Henry", code: "no" },
  { name: "Layla", code: "tr" },
  { name: "Ahmad", code: "id" },
  { name: "Sofia", code: "ar" },
  { name: "Leo", code: "ch" },
  { name: "Fatima", code: "bd" },
  { name: "Jack", code: "nz" },
];

