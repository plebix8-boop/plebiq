"use client";

import { createPortal } from "react-dom";
import { useEffect, useRef, useState } from "react";
import { AppInput } from "@/components/form-controls";

type AdminDateTimePickerProps = {
  value: string;
  onChange: (value: string) => void;
  name?: string;
  placeholder?: string;
};

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function parseValue(value: string) {
  if (!value) return null;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

function formatDisplay(value: string) {
  const d = parseValue(value);
  if (!d) return "";
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export function AdminDateTimePicker({
  value,
  onChange,
  name,
  placeholder = "Pick date & time…",
}: AdminDateTimePickerProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [popoverStyle, setPopoverStyle] = useState<React.CSSProperties>({});
  const buttonRef = useRef<HTMLButtonElement>(null);

  const parsedValue = parseValue(value);
  const [viewYear, setViewYear] = useState(() => parsedValue?.getFullYear() ?? new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(() => parsedValue?.getMonth() ?? new Date().getMonth());
  const [hour, setHour] = useState(() => (parsedValue ? pad2(parsedValue.getHours()) : "00"));
  const [minute, setMinute] = useState(() => (parsedValue ? pad2(parsedValue.getMinutes()) : "00"));

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const d = parseValue(value);
    if (d) {
      setHour(pad2(d.getHours()));
      setMinute(pad2(d.getMinutes()));
    }
  }, [value]);

  useEffect(() => {
    if (!open) return;
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const dropdownWidth = 280;
      const left = Math.min(rect.left, window.innerWidth - dropdownWidth - 8);
      setPopoverStyle({
        position: "fixed",
        top: rect.bottom + 4,
        left,
        width: dropdownWidth,
        zIndex: 9999,
      });
    }
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    function handleOutside(e: MouseEvent) {
      if (
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node) &&
        !(e.target as Element).closest("[data-admin-dtp-popover]")
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [open]);

  function daysInMonth(y: number, m: number) {
    return new Date(y, m + 1, 0).getDate();
  }

  function firstDayOfMonth(y: number, m: number) {
    return new Date(y, m, 1).getDay();
  }

  function selectDate(day: number) {
    const h = Math.max(0, Math.min(23, parseInt(hour, 10) || 0));
    const m = Math.max(0, Math.min(59, parseInt(minute, 10) || 0));
    onChange(`${viewYear}-${pad2(viewMonth + 1)}-${pad2(day)}T${pad2(h)}:${pad2(m)}`);
  }

  function applyTime(newHour: string, newMinute: string) {
    const d = parseValue(value);
    if (!d) return;
    const h = Math.max(0, Math.min(23, parseInt(newHour, 10) || 0));
    const m = Math.max(0, Math.min(59, parseInt(newMinute, 10) || 0));
    onChange(`${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}T${pad2(h)}:${pad2(m)}`);
  }

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  }

  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  }

  function setNow() {
    const now = new Date();
    setViewYear(now.getFullYear());
    setViewMonth(now.getMonth());
    const h = pad2(now.getHours());
    const m = pad2(now.getMinutes());
    setHour(h);
    setMinute(m);
    onChange(`${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}T${h}:${m}`);
  }

  const today = new Date();
  const totalDays = daysInMonth(viewYear, viewMonth);
  const startOffset = firstDayOfMonth(viewYear, viewMonth);

  const popover = open && mounted ? createPortal(
    <div
      data-admin-dtp-popover
      style={popoverStyle}
      className="rounded-xl border border-admin-picker-panel-border bg-admin-picker-panel-bg text-admin-picker-text shadow-2xl"
    >
      {/* Month nav */}
      <div className="flex items-center justify-between border-b border-admin-divider px-4 py-3">
        <button type="button" onClick={prevMonth} className="flex size-7 items-center justify-center rounded-lg text-admin-picker-muted transition hover:bg-admin-picker-option-bg-hover hover:text-admin-picker-option-text-hover">
          <svg className="size-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <span className="text-sm font-semibold text-admin-picker-text">{MONTHS[viewMonth]} {viewYear}</span>
        <button type="button" onClick={nextMonth} className="flex size-7 items-center justify-center rounded-lg text-admin-picker-muted transition hover:bg-admin-picker-option-bg-hover hover:text-admin-picker-option-text-hover">
          <svg className="size-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 px-3 pt-3">
        {DAYS.map((d) => (
          <div key={d} className="py-1 text-center text-[10px] font-semibold uppercase tracking-wide text-admin-picker-muted">{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 px-3 pb-3">
        {Array.from({ length: startOffset }).map((_, i) => <div key={`b${i}`} />)}
        {Array.from({ length: totalDays }).map((_, i) => {
          const day = i + 1;
          const isToday = day === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();
          const isSelected = parsedValue
            ? day === parsedValue.getDate() && viewMonth === parsedValue.getMonth() && viewYear === parsedValue.getFullYear()
            : false;
          return (
            <button
              key={day}
              type="button"
              onClick={() => selectDate(day)}
              className={`mx-auto flex size-8 items-center justify-center rounded-lg text-sm transition ${
                isSelected
                  ? "bg-admin-picker-option-selected-bg font-semibold text-admin-picker-option-selected-text shadow-[0_0_12px_var(--glow-accent)]"
                  : isToday
                  ? "border border-admin-card-border-hover text-admin-picker-text hover:bg-admin-picker-option-bg-hover"
                  : "text-admin-picker-option-text hover:bg-admin-picker-option-bg-hover hover:text-admin-picker-option-text-hover"
              }`}
            >
              {day}
            </button>
          );
        })}
      </div>

      {/* Time picker */}
      <div className="border-t border-admin-divider px-4 py-3">
        <div className="flex items-center gap-3">
          <svg className="size-4 shrink-0 text-admin-picker-muted" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div className="flex flex-1 items-center justify-center gap-2">
            {/* Hour */}
            <div className="flex flex-col items-center gap-0.5">
              <button type="button" onClick={() => { const h = pad2(Math.min(23, (parseInt(hour, 10) || 0) + 1)); setHour(h); applyTime(h, minute); }}
                className="flex size-6 items-center justify-center rounded text-admin-picker-muted transition hover:bg-admin-picker-option-bg-hover hover:text-admin-picker-option-text-hover">
                <svg className="size-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M18 15l-6-6-6 6" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
              <AppInput
                type="text" value={hour}
                onFocus={(e) => e.target.select()}
                onChange={(e) => setHour(e.target.value.replace(/\D/g, "").slice(0, 2))}
                onBlur={(e) => { const h = pad2(Math.max(0, Math.min(23, parseInt(e.target.value, 10) || 0))); setHour(h); applyTime(h, minute); }}
                tone="dark"
                className="w-10 rounded-lg px-0 py-1.5 text-center font-mono font-semibold"
              />
              <button type="button" onClick={() => { const h = pad2(Math.max(0, (parseInt(hour, 10) || 0) - 1)); setHour(h); applyTime(h, minute); }}
                className="flex size-6 items-center justify-center rounded text-admin-picker-muted transition hover:bg-admin-picker-option-bg-hover hover:text-admin-picker-option-text-hover">
                <svg className="size-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
            </div>
            <span className="mb-1 text-lg font-bold text-admin-picker-muted">:</span>
            {/* Minute */}
            <div className="flex flex-col items-center gap-0.5">
              <button type="button" onClick={() => { const m = pad2(Math.min(59, Math.round((parseInt(minute, 10) || 0) / 5) * 5 + 5)); setMinute(m); applyTime(hour, m); }}
                className="flex size-6 items-center justify-center rounded text-admin-picker-muted transition hover:bg-admin-picker-option-bg-hover hover:text-admin-picker-option-text-hover">
                <svg className="size-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M18 15l-6-6-6 6" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
              <AppInput
                type="text" value={minute}
                onFocus={(e) => e.target.select()}
                onChange={(e) => setMinute(e.target.value.replace(/\D/g, "").slice(0, 2))}
                onBlur={(e) => { const m = pad2(Math.max(0, Math.min(59, parseInt(e.target.value, 10) || 0))); setMinute(m); applyTime(hour, m); }}
                tone="dark"
                className="w-10 rounded-lg px-0 py-1.5 text-center font-mono font-semibold"
              />
              <button type="button" onClick={() => { const m = pad2(Math.max(0, Math.round((parseInt(minute, 10) || 0) / 5) * 5 - 5)); setMinute(m); applyTime(hour, m); }}
                className="flex size-6 items-center justify-center rounded text-admin-picker-muted transition hover:bg-admin-picker-option-bg-hover hover:text-admin-picker-option-text-hover">
                <svg className="size-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-admin-divider px-4 py-3">
        <button type="button" onClick={setNow} className="text-xs font-semibold text-admin-picker-muted transition hover:text-admin-picker-text">
          Now
        </button>
        <div className="flex gap-2">
          {value && (
            <button type="button" onClick={() => { onChange(""); setOpen(false); }}
              className="rounded-lg border border-admin-button-secondary-border bg-admin-button-secondary-bg px-3 py-1.5 text-xs font-semibold text-admin-button-secondary-text transition hover:bg-admin-button-secondary-bg-hover">
              Clear
            </button>
          )}
          <button type="button" onClick={() => setOpen(false)}
            className="rounded-lg bg-admin-button-primary-bg px-3 py-1.5 text-xs font-semibold text-admin-button-primary-text transition hover:bg-admin-button-primary-bg-hover">
            Done
          </button>
        </div>
      </div>
    </div>,
    document.body,
  ) : null;

  return (
    <div className="relative">
      {name && <input type="hidden" name={name} value={value} />}
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex w-full items-center justify-between rounded-xl border px-4 py-2.5 text-sm transition ${
          open
            ? "border-field-border-focus bg-field-dark-bg-focus ring-2 ring-accent/20"
            : "border-field-dark-border bg-field-dark-bg hover:border-field-dark-border-hover hover:bg-field-dark-bg-hover"
        } ${value ? "text-field-dark-text" : "text-field-dark-placeholder"}`}
      >
        <div className="flex items-center gap-2.5">
          <svg className="size-4 shrink-0 text-field-dark-placeholder" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <rect x="3" y="4" width="18" height="18" rx="3" /><path d="M3 9h18M8 2v4M16 2v4" strokeLinecap="round" />
          </svg>
          <span>{value ? formatDisplay(value) : placeholder}</span>
        </div>
        {value ? (
          <button type="button" onClick={(e) => { e.stopPropagation(); onChange(""); }}
            className="ml-2 text-field-dark-placeholder transition hover:text-field-dark-text">
            <svg className="size-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        ) : (
          <svg className="ml-2 size-4 shrink-0 text-field-dark-placeholder" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>
      {popover}
    </div>
  );
}
