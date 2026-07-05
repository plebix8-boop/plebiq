import type { AdminDashboardSummaryCard } from "@/features/admin/types";

const icons: Record<string, React.ReactNode> = {
  users: (
    <svg className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  "user-plus": (
    <svg className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <line x1="19" y1="8" x2="19" y2="14" />
      <line x1="16" y1="11" x2="22" y2="11" />
    </svg>
  ),
  poll: (
    <svg className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path strokeLinecap="round" d="M8 12h8M8 8h5M8 16h3" />
    </svg>
  ),
  vote: (
    <svg className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      <polyline points="9 11 12 14 22 4" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  ),
  eye: (
    <svg className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  trend: (
    <svg className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  ),
};

export function SummaryCards({
  cards,
}: {
  cards: AdminDashboardSummaryCard[];
}) {
  return (
    <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(min(100%,200px),1fr))]">
      {cards.length === 0 ? (
        <div className="col-span-full rounded-2xl border border-admin-card-border bg-admin-card-bg px-5 py-8 text-center text-sm text-admin-text-muted backdrop-blur-sm">
          No summary data available yet.
        </div>
      ) : null}
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-2xl border border-admin-card-border bg-admin-card-bg p-5 backdrop-blur-sm"
        >
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-widest text-admin-text-muted">{card.label}</p>
            <span className="text-admin-nav-active-text">{icons[card.icon]}</span>
          </div>
          <p className="text-2xl font-bold text-admin-text">{card.value}</p>
          {card.change && (
            <p className="mt-1.5 text-xs text-admin-success-text">
              {card.change}
              {card.changeLabel && (
                <span className="ml-1 text-admin-text-muted">{card.changeLabel}</span>
              )}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
