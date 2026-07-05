"use client";

type AdminToggleProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
};

export function AdminToggle({ checked, onChange, label, description }: AdminToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/40 ${
        checked
          ? "border-admin-card-border-hover bg-admin-nav-active-bg hover:bg-admin-surface-hover"
          : "border-admin-button-secondary-border bg-admin-button-secondary-bg hover:bg-admin-button-secondary-bg-hover"
      }`}
    >
      {/* Track */}
      <div
        className={`relative h-5 w-9 shrink-0 rounded-full transition-all duration-200 ${
          checked
            ? "bg-admin-button-primary-bg shadow-[0_0_10px_var(--glow-accent)]"
            : "bg-admin-surface-hover"
        }`}
      >
        <div
          className={`absolute top-0.5 size-4 rounded-full shadow transition-all duration-200 ${
            checked ? "translate-x-4 bg-admin-button-primary-text" : "translate-x-0.5 bg-admin-text-muted"
          }`}
        />
      </div>
      {/* Label */}
      <div>
        <div className={`text-sm font-medium transition-colors duration-150 ${checked ? "text-admin-text" : "text-admin-text-muted"}`}>
          {label}
        </div>
        {description && (
          <div className="mt-0.5 text-xs text-admin-text-subtle">{description}</div>
        )}
      </div>
    </button>
  );
}
