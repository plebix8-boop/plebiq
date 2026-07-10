import Link from "next/link";

type LegalSection = {
  title: string;
  body: string[];
};

type LegalPageProps = {
  title: string;
  description: string;
  updated: string;
  sections: LegalSection[];
};

export function LegalPage({ title, description, updated, sections }: LegalPageProps) {
  return (
    <main className="min-h-screen bg-app-bg px-5 py-10 text-app-fg sm:px-8 lg:px-10">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/"
          className="inline-flex items-center text-sm font-semibold text-accent transition hover:text-accent-alt"
        >
          Back to Plebiq
        </Link>

        <header className="mt-10 border-b border-border pb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">
            Legal
          </p>
          <h1 className="mt-3 text-4xl font-bold leading-tight sm:text-5xl">
            {title}
          </h1>
          <p className="mt-4 text-base leading-7 text-muted">{description}</p>
          <p className="mt-4 text-sm font-medium text-muted">Last updated: {updated}</p>
        </header>

        <div className="space-y-9 py-9">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="text-xl font-bold text-app-fg">{section.title}</h2>
              <div className="mt-3 space-y-3 text-sm leading-7 text-muted sm:text-base">
                {section.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
