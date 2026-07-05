"use client";

import { useTheme, type ThemePreference } from "@/contexts/theme-context";

const themeOptions: Array<{
  value: ThemePreference;
  label: string;
  icon: "system" | "light" | "dark";
}> = [
  { value: "system", label: "System", icon: "system" },
  { value: "light", label: "Light", icon: "light" },
  { value: "dark", label: "Dark", icon: "dark" },
];

function ThemeIcon({ icon }: { icon: "system" | "light" | "dark" }) {
  if (icon === "light") {
    return (
      <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="4" />
        <path strokeLinecap="round" d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
      </svg>
    );
  }

  if (icon === "dark") {
    return (
      <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.8A8.5 8.5 0 1 1 11.2 3a6.5 6.5 0 0 0 9.8 9.8Z" />
      </svg>
    );
  }

  return (
    <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="12" rx="2" />
      <path strokeLinecap="round" d="M8 20h8M12 16v4" />
    </svg>
  );
}

export function ThemeSwitcher({ className = "" }: { className?: string }) {
  const { theme, setTheme } = useTheme();

  return (
    <div className={className}>
      <p className="mb-2 px-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
        Theme
      </p>
      <div className="grid grid-cols-3 gap-1 rounded-2xl border border-border bg-surface-soft p-1">
        {themeOptions.map((option) => {
          const active = theme === option.value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => setTheme(option.value)}
              aria-pressed={active}
              className={`inline-flex h-9 items-center justify-center gap-1.5 rounded-xl text-xs font-semibold transition ${
                active
                  ? "bg-filter-active-bg text-filter-active-text shadow-[0_8px_24px_var(--shadow-soft)]"
                  : "text-muted hover:bg-filter-idle-bg-hover hover:text-faint"
              }`}
            >
              <ThemeIcon icon={option.icon} />
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
