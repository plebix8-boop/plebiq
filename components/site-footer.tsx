import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-app-bg px-5 py-8 text-app-fg sm:px-8 lg:px-10">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} Plebiq</p>
        <nav aria-label="Legal" className="flex flex-wrap gap-x-5 gap-y-2">
          <Link className="transition hover:text-accent" href="/privacy-policy">
            Privacy Policy
          </Link>
          <Link className="transition hover:text-accent" href="/terms-of-service">
            Terms of Service
          </Link>
          <Link className="transition hover:text-accent" href="/data-deletion">
            Data Deletion
          </Link>
        </nav>
      </div>
    </footer>
  );
}
