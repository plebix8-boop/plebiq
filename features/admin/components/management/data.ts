export type ManagedPoll = {
  id: string;
  title: string;
  category: string;
  status: "Live" | "Draft" | "Closed";
  image_url: string;
  votes: number;
  views: number;
  options: {
    label: string;
    description: string;
  }[];
  created_at: string;
  is_featured: boolean;
  is_pinned: boolean;
};

export const managedPolls: ManagedPoll[] = [
  {
    id: "1",
    title: "Should social media be regulated by governments?",
    category: "Politics",
    status: "Live",
    image_url: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=400&q=80",
    votes: 18420,
    views: 42000,
    options: [
      {
        label: "Yes, with clear platform rules",
        description: "Governments should set transparency and safety standards.",
      },
      {
        label: "Only for harmful content",
        description: "Intervene in cases like scams, abuse, or misinformation.",
      },
      {
        label: "No, platforms should self-regulate",
        description: "Private companies should manage their own moderation systems.",
      },
      {
        label: "Use independent oversight instead",
        description: "A neutral body could review major moderation decisions.",
      },
    ],
    created_at: "Apr 20, 2025",
    is_featured: true,
    is_pinned: false,
  },
  {
    id: "2",
    title: "Best programming language in 2025?",
    category: "Technology",
    status: "Live",
    image_url: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&q=80",
    votes: 15200,
    views: 28000,
    options: [
      {
        label: "TypeScript",
        description: "Strong typing with excellent web ecosystem support.",
      },
      {
        label: "Python",
        description: "Flexible, beginner-friendly, and strong for AI and scripting.",
      },
      {
        label: "Go",
        description: "Fast, simple, and great for backend infrastructure.",
      },
      {
        label: "Rust",
        description: "Memory-safe systems programming with growing adoption.",
      },
      {
        label: "Java",
        description: "Enterprise-ready and still widely used in large systems.",
      },
      {
        label: "Other",
        description: "A different language deserves the top spot this year.",
      },
    ],
    created_at: "Apr 22, 2025",
    is_featured: false,
    is_pinned: true,
  },
  {
    id: "3",
    title: "Is remote work better than office work?",
    category: "Work",
    status: "Live",
    image_url: "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=400&q=80",
    votes: 12800,
    views: 45000,
    options: [
      {
        label: "Remote work is better",
        description: "People gain flexibility and can focus without commuting.",
      },
      {
        label: "Hybrid is the best balance",
        description: "A mix of home and office gives teams flexibility and connection.",
      },
      {
        label: "Office work is better",
        description: "In-person collaboration still creates better alignment and culture.",
      },
    ],
    created_at: "Apr 25, 2025",
    is_featured: false,
    is_pinned: false,
  },
  {
    id: "4",
    title: "Who will win the Champions League 2025?",
    category: "Sports",
    status: "Live",
    image_url: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=400&q=80",
    votes: 22100,
    views: 38000,
    options: [
      {
        label: "Manchester City",
        description: "Their squad depth and recent form make them favorites.",
      },
      {
        label: "Real Madrid",
        description: "Their experience in big knockout matches is hard to beat.",
      },
      {
        label: "Bayern Munich",
        description: "They can dominate both possession and transition moments.",
      },
      {
        label: "Arsenal",
        description: "A young, sharp team with real momentum this season.",
      },
      {
        label: "Barcelona",
        description: "A balanced side with match-winners across the pitch.",
      },
      {
        label: "Inter Milan",
        description: "Tactically disciplined and dangerous in tight matches.",
      },
      {
        label: "PSG",
        description: "They have star power and enough quality to go all the way.",
      },
      {
        label: "Another club",
        description: "A different team will surprise everyone and lift the trophy.",
      },
    ],
    created_at: "Apr 28, 2025",
    is_featured: true,
    is_pinned: true,
  },
  {
    id: "5",
    title: "Should college education be free for all?",
    category: "Education",
    status: "Live",
    image_url: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400&q=80",
    votes: 8900,
    views: 31000,
    options: [
      {
        label: "Yes, for public colleges",
        description: "Tuition-free public education should be widely available.",
      },
      {
        label: "Only for low-income students",
        description: "Support should focus on people who need it most.",
      },
      {
        label: "No, improve aid instead",
        description: "Better scholarships and grants are a more realistic solution.",
      },
    ],
    created_at: "Apr 30, 2025",
    is_featured: false,
    is_pinned: false,
  },
  {
    id: "6",
    title: "Best diet trend of 2025?",
    category: "Health",
    status: "Live",
    image_url: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=80",
    votes: 13820,
    views: 25500,
    options: [
      {
        label: "Mediterranean diet",
        description: "Balanced, sustainable, and backed by long-term health research.",
      },
      {
        label: "High-protein plan",
        description: "Helps people stay full and support fitness goals.",
      },
      {
        label: "Plant-based eating",
        description: "Focuses on whole foods and lower environmental impact.",
      },
      {
        label: "Intermittent fasting",
        description: "Popular for timing-based structure rather than food restrictions.",
      },
      {
        label: "Low-carb lifestyle",
        description: "Appeals to people aiming to reduce sugar and refined foods.",
      },
    ],
    created_at: "May 1, 2025",
    is_featured: false,
    is_pinned: false,
  },
  {
    id: "7",
    title: "Is climate change our biggest threat?",
    category: "Environment",
    status: "Closed",
    image_url: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&q=80",
    votes: 34200,
    views: 71000,
    options: [
      {
        label: "Yes, absolutely",
        description: "Its scale and long-term effects make it the biggest global risk.",
      },
      {
        label: "One of several major threats",
        description: "It matters deeply, but conflict, health, and inequality do too.",
      },
      {
        label: "Economic instability is bigger",
        description: "Financial shocks can destabilize societies even faster.",
      },
      {
        label: "Conflict and war are bigger",
        description: "Immediate geopolitical threats deserve the highest urgency.",
      },
    ],
    created_at: "Mar 10, 2025",
    is_featured: false,
    is_pinned: false,
  },
  {
    id: "8",
    title: "Should electric vehicles replace petrol cars by 2035?",
    category: "Technology",
    status: "Draft",
    image_url: "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=400&q=80",
    votes: 0,
    views: 0,
    options: [
      {
        label: "Yes, by 2035",
        description: "The transition should happen quickly with policy support.",
      },
      {
        label: "Yes, but on a slower timeline",
        description: "Adoption will rise, but full replacement will take longer.",
      },
      {
        label: "No, multiple vehicle types will remain",
        description: "EVs will grow, but petrol and hybrid cars will still coexist.",
      },
    ],
    created_at: "May 4, 2025",
    is_featured: false,
    is_pinned: false,
  },
  {
    id: "9",
    title: "What is the best social media platform?",
    category: "Technology",
    status: "Draft",
    image_url: "https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=400&q=80",
    votes: 0,
    views: 0,
    options: [
      {
        label: "YouTube",
        description: "Best for long-form value, discovery, and creator depth.",
      },
      {
        label: "Instagram",
        description: "Strong visual storytelling with broad everyday engagement.",
      },
      {
        label: "X",
        description: "Still useful for real-time updates and public conversation.",
      },
      {
        label: "TikTok",
        description: "Short-form video remains unmatched for reach and trends.",
      },
      {
        label: "LinkedIn",
        description: "Best platform for professional content and industry networking.",
      },
    ],
    created_at: "May 5, 2025",
    is_featured: false,
    is_pinned: false,
  },
];
