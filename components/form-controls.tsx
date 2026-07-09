"use client";

import {
  createContext,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type InputHTMLAttributes,
  type ReactNode,
  type TextareaHTMLAttributes,
} from "react";
import { createPortal } from "react-dom";

export type SelectOption = { value: string; label: string };

type FieldTone = "light" | "dark";

const FieldToneContext = createContext<FieldTone>("light");

export function FieldToneProvider({
  tone,
  children,
}: {
  tone: FieldTone;
  children: ReactNode;
}) {
  return (
    <FieldToneContext.Provider value={tone}>
      {children}
    </FieldToneContext.Provider>
  );
}

function useFieldTone(tone?: FieldTone) {
  return tone ?? useContext(FieldToneContext);
}

function fieldClasses(tone: FieldTone, extra = "") {
  const base =
    "w-full rounded-xl border px-4 py-3 text-sm outline-none transition duration-150 disabled:cursor-not-allowed disabled:opacity-60";
  const colors =
    tone === "dark"
      ? "border-field-border-focus bg-field-dark-bg-focus text-field-dark-text placeholder:text-field-dark-placeholder hover:border-field-border-focus hover:bg-field-dark-bg-focus focus:border-field-border-focus focus:bg-field-dark-bg-focus focus:ring-2 focus:ring-accent/20"
      : "border-field-border-focus bg-field-light-bg-focus text-field-light-text placeholder:text-field-light-placeholder hover:border-field-border-focus hover:bg-field-light-bg-focus focus:border-field-border-focus focus:bg-field-light-bg-focus focus:ring-2 focus:ring-accent/20";

  return `${base} ${colors} ${extra}`.trim();
}

export type AppInputProps = InputHTMLAttributes<HTMLInputElement> & {
  tone?: FieldTone;
};

export function AppInput({ tone, className = "", ...props }: AppInputProps) {
  const resolvedTone = useFieldTone(tone);

  return (
    <input
      {...props}
      className={fieldClasses(resolvedTone, className)}
    />
  );
}

export type AppTextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  tone?: FieldTone;
};

export function AppTextarea({
  tone,
  className = "",
  ...props
}: AppTextareaProps) {
  const resolvedTone = useFieldTone(tone);

  return (
    <textarea
      {...props}
      className={fieldClasses(resolvedTone, className)}
    />
  );
}

export type AppSelectProps = {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  name?: string;
  id?: string;
  searchThreshold?: number;
  tone?: FieldTone;
  className?: string;
};

export function AppSelect({
  value,
  onChange,
  options,
  placeholder = "Select...",
  name,
  id,
  searchThreshold = 7,
  tone,
  className = "",
}: AppSelectProps) {
  const resolvedTone = useFieldTone(tone);
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [mounted, setMounted] = useState(false);
  const [popoverStyle, setPopoverStyle] = useState<CSSProperties>({});
  const buttonRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const selected = options.find((option) => option.value === value);
  const showSearch = options.length > searchThreshold;
  const filtered = showSearch
    ? options.filter((option) =>
        option.label.toLowerCase().includes(search.toLowerCase()),
      )
    : options;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) {
      setSearch("");
      return;
    }

    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPopoverStyle({
        position: "fixed",
        top: rect.bottom + 6,
        left: rect.left,
        width: rect.width,
        zIndex: 9999,
      });
    }

    if (showSearch) {
      const timeout = window.setTimeout(() => searchRef.current?.focus(), 50);
      return () => window.clearTimeout(timeout);
    }

    return undefined;
  }, [open, showSearch]);

  useEffect(() => {
    if (!open) return undefined;

    function handleOutside(event: MouseEvent) {
      if (
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node) &&
        !(event.target as Element).closest("[data-app-select-popover]")
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [open]);

  const triggerColors =
    resolvedTone === "dark"
      ? open
        ? "border-field-border-focus bg-field-dark-bg-focus ring-2 ring-accent/20"
        : "border-field-border-focus bg-field-dark-bg-focus hover:border-field-border-focus hover:bg-field-dark-bg-focus"
      : open
        ? "border-field-border-focus bg-field-light-bg-focus ring-2 ring-accent/20"
        : "border-field-border-focus bg-field-light-bg-focus hover:border-field-border-focus hover:bg-field-light-bg-focus";
  const textColor = selected
    ? resolvedTone === "dark"
      ? "text-field-dark-text"
      : "text-field-light-text"
    : resolvedTone === "dark"
      ? "text-field-dark-placeholder"
      : "text-field-light-placeholder";
  const panelColors =
    resolvedTone === "dark"
      ? "border-field-dark-border bg-field-dark-panel-bg"
      : "border-field-light-border bg-field-light-panel-bg";
  const panelStyle = {
    backgroundColor:
      resolvedTone === "dark"
        ? "var(--field-dark-panel-bg)"
        : "var(--field-light-panel-bg)",
    color:
      resolvedTone === "dark"
        ? "var(--field-dark-text)"
        : "var(--field-light-text)",
  };
  const searchColors =
    resolvedTone === "dark"
      ? "border-field-border-focus bg-field-dark-bg-focus text-field-dark-text placeholder:text-field-dark-placeholder focus-within:border-field-border-focus focus-within:ring-accent/20"
      : "border-field-border-focus bg-field-light-bg-focus text-field-light-text placeholder:text-field-light-placeholder focus-within:border-field-border-focus focus-within:bg-field-light-bg-focus focus-within:ring-accent/20";
  const optionBase =
    resolvedTone === "dark" ? "text-field-dark-text" : "text-field-light-text";
  const optionActive =
    resolvedTone === "dark"
      ? "bg-field-dark-option-active-bg text-field-dark-option-active-text"
      : "bg-field-light-option-active-bg text-field-light-option-active-text";
  const optionHover =
    resolvedTone === "dark"
      ? "hover:bg-field-dark-option-hover-bg hover:text-field-dark-text"
      : "hover:bg-field-light-option-hover-bg hover:text-field-light-text";

  const popover =
    open && mounted
      ? createPortal(
          <div
            data-app-select-popover
            style={{ ...popoverStyle, ...panelStyle }}
            className={`overflow-hidden rounded-xl border shadow-[0_24px_70px_var(--shadow-soft)] ${panelColors}`}
          >
            {showSearch && (
              <div className="border-b border-border px-3 py-2.5">
                <div
                  className={`flex items-center gap-2 rounded-lg border px-3 py-2 transition focus-within:ring-2 ${searchColors}`}
                >
                  <svg
                    className="size-3.5 shrink-0 text-muted"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    viewBox="0 0 24 24"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
                  </svg>
                  <input
                    ref={searchRef}
                    type="text"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search..."
                    className="w-full bg-transparent text-xs outline-none placeholder:text-muted"
                  />
                  {search && (
                    <button
                      type="button"
                      onClick={() => setSearch("")}
                      className="shrink-0 text-muted transition hover:text-accent"
                    >
                      <svg
                        className="size-3.5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        viewBox="0 0 24 24"
                      >
                        <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            )}

            <ul
              className="max-h-52 overflow-y-auto py-1 [scrollbar-color:var(--fg-12)_transparent] [scrollbar-width:thin]"
              role="listbox"
            >
              {filtered.length === 0 ? (
                <li className="px-4 py-3 text-sm text-muted">No results</li>
              ) : (
                filtered.map((option) => {
                  const active = value === option.value;

                  return (
                    <li
                      aria-selected={active}
                      key={option.value}
                      onClick={() => {
                        onChange(option.value);
                        setOpen(false);
                        setSearch("");
                      }}
                      role="option"
                      className={`flex cursor-pointer items-center justify-between px-4 py-2.5 text-sm transition-colors ${optionHover} ${
                        active ? optionActive : optionBase
                      }`}
                    >
                      {option.label}
                      {active && (
                        <svg
                          className="size-3.5 shrink-0 text-accent"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          viewBox="0 0 24 24"
                        >
                          <path
                            d="M20 6L9 17l-5-5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </li>
                  );
                })
              )}
            </ul>
          </div>,
          document.body,
        )
      : null;

  return (
    <div className="relative">
      {name && <input id={inputId} name={name} type="hidden" value={value} />}
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-haspopup="listbox"
        className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-sm outline-none transition duration-150 ${triggerColors} ${textColor} ${className}`}
      >
        <span className="truncate">{selected?.label ?? placeholder}</span>
        <svg
          className={`ml-2 size-4 shrink-0 text-muted transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {popover}
    </div>
  );
}
