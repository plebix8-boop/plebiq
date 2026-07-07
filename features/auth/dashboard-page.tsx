import { AppButtonLink } from "@/components/ui/button";
import { SignOutButton } from "./components/sign-out-button";

type DashboardPageProps = {
  email: string;
  name?: string | null;
  role?: string | null;
};

export function DashboardPage({ email, name, role }: DashboardPageProps) {
  const isAdmin = role === "admin";

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">
      <div className="mx-auto flex max-w-5xl flex-col gap-8">
        <header className="flex flex-col gap-4 rounded-[2rem] border border-white/10 bg-white/5 p-8 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/80">
              Protected Route
            </p>
            <h1 className="text-4xl font-semibold tracking-tight">
              Welcome back{name ? `, ${name}` : ""}.
            </h1>
            <p className="text-slate-300">
              You&apos;re signed in as <span className="text-white">{email}</span>.
            </p>
            <p className="text-sm text-slate-400">
              Current role: <span className="font-semibold uppercase text-cyan-300">{role ?? "user"}</span>
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {isAdmin ? (
              <AppButtonLink
                href="/admin"
              >
                Open admin panel
              </AppButtonLink>
            ) : null}
            <SignOutButton />
          </div>
        </header>

        <section className="grid gap-5 md:grid-cols-3">
          <article className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6">
            <p className="text-sm text-slate-400">Status</p>
            <p className="mt-3 text-2xl font-semibold">Authenticated</p>
          </article>
          <article className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6">
            <p className="text-sm text-slate-400">Session</p>
            <p className="mt-3 text-2xl font-semibold">Supabase SSR</p>
          </article>
          <article className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6">
            <p className="text-sm text-slate-400">Landing feature</p>
            <p className="mt-3 text-2xl font-semibold">Untouched</p>
          </article>
          <article className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6">
            <p className="text-sm text-slate-400">Admin access</p>
            <p className="mt-3 text-2xl font-semibold">
              {isAdmin ? "Enabled" : "User only"}
            </p>
          </article>
        </section>
      </div>
    </main>
  );
}
