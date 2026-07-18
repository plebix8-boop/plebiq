import { Suspense } from "react";
import { unstable_cache } from "next/cache";
import { AppButtonLink } from "@/components/ui/button";
import { ThemeLogo } from "@/components/theme-logo";
import { createAdminClient } from "@/utils/supabase/admin";
import { LandingPage } from "@/features/landing/landing-page";
import type { FeaturedPoll } from "@/features/landing/data";

const OPTION_ACCENTS = [
  "from-accent to-accent-alt",
  "from-accent-alt to-accent",
  "from-warning to-accent",
  "from-success to-accent-alt",
  "from-danger to-accent",
  "from-info to-accent-alt",
];

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80";

type RawOption = {
  id: string;
  label: string;
  description: string | null;
  sort_order: number | null;
  vote_count: number | null;
};

type RawPoll = {
  id: string;
  title: string;
  description: string | null;
  is_featured: boolean | null;
  is_pinned: boolean | null;
  sort_order: number | null;
  image_url: string | null;
  category: { id: string; name: string; slug: string } | { id: string; name: string; slug: string }[] | null;
  options: RawOption[];
};

function toFeaturedPoll(poll: RawPoll): FeaturedPoll {
  const category = Array.isArray(poll.category)
    ? (poll.category[0] ?? null)
    : poll.category;

  const sortedOptions = [...poll.options].sort(
    (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0),
  );

  const totalVotes = sortedOptions.reduce(
    (sum, o) => sum + (o.vote_count ?? 0),
    0,
  );

  return {
    id: poll.id,
    tag: poll.is_featured
      ? "Featured live poll"
      : (category?.name ?? "Live poll"),
    category: category?.name ?? "General",
    image: poll.image_url || FALLBACK_IMAGE,
    question: poll.title,
    description: poll.description ?? "",
    options: sortedOptions.map((opt, i) => ({
      id: opt.id,
      label: opt.label,
      description: opt.description ?? "",
      accent: OPTION_ACCENTS[i % OPTION_ACCENTS.length],
      previewWidth:
        totalVotes > 0
          ? `${Math.max(4, Math.round(((opt.vote_count ?? 0) / totalVotes) * 100))}%`
          : `${Math.round(100 / Math.max(sortedOptions.length, 1))}%`,
    })),
  };
}

const fetchLivePolls = unstable_cache(
  async () => {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("polls")
      .select(
        `
          id, title, description, is_featured, is_pinned, sort_order, image_url,
          category:categories(id, name, slug),
          options:poll_options(id, label, description, sort_order, vote_count)
        `,
      )
      .eq("status", "live")
      .order("sort_order", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: false });
    return data as RawPoll[] | null;
  },
  ["landing-polls"],
  { revalidate: 60 },
);

function EmptyLandingState() {
  return (
    <main className="relative grid min-h-screen overflow-hidden bg-app-bg px-5 py-8 text-app-fg">
      <div className="decorative-blur absolute -left-40 -top-40 h-[520px] w-[520px] rounded-full bg-accent/20 blur-[130px]" />
      <div className="decorative-blur absolute -bottom-40 -right-40 h-[440px] w-[440px] rounded-full bg-accent-alt/15 blur-[120px]" />

      <div className="relative z-10 flex min-h-full flex-col">
        <header className="flex items-center justify-between">
          <ThemeLogo
            alt="Plebiq"
            width={1266}
            height={435}
            className="h-15 w-auto"
            priority
          />
          <AppButtonLink
            href="/auth/sign-in"
            variant="secondary"
          >
            Sign in
          </AppButtonLink>
        </header>

        <section className="mx-auto flex flex-1 max-w-3xl flex-col items-center justify-center py-24 text-center">
          <p className="mb-4 rounded-full border border-border bg-surface-soft px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted">
            Quiet for the moment
          </p>
          <h1 className="text-4xl font-bold leading-tight sm:text-6xl">
            New polls are coming soon.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-muted sm:text-lg">
            There are no live questions open right now. Check back soon to add
            your voice when the next poll goes live.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
            <AppButtonLink
              href="/auth/sign-in"
              size="lg"
            >
              Sign in to Plebiq
            </AppButtonLink>
          </div>
        </section>
      </div>
    </main>
  );
}

async function PollsContent() {
  const rawPolls = await fetchLivePolls();

  if (!rawPolls || rawPolls.length === 0) {
    return <EmptyLandingState />;
  }

  const polls = (rawPolls as RawPoll[]).map(toFeaturedPoll);

  const featured = polls[0];

  const uniqueCategories = [
    ...new Set(
      (rawPolls as RawPoll[]).map((p) => {
        const cat = Array.isArray(p.category) ? p.category[0] : p.category;
        return cat?.name ?? "General";
      }),
    ),
  ];
  const categories = ["All", ...uniqueCategories];

  return (
    <LandingPage
      featuredPoll={featured}
      feedPolls={polls}
      feedCategories={categories}
    />
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-app-bg" />}>
      <PollsContent />
    </Suspense>
  );
}
