"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AppButton } from "@/components/ui/button";
import { createVoteCampaign } from "@/features/admin/actions";
import type { VoteCampaignPoll, VoteCampaignState } from "@/features/admin/types";

const initialState: VoteCampaignState = {};

function toDateTimeLocal(date: Date) {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function formatDateTimeLabel(value: string) {
  if (!value) {
    return "Pick date and time";
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return "Pick date and time";
  }

  return parsed.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function ChevronButton({
  direction,
  onClick,
}: {
  direction: "up" | "down";
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex size-7 items-center justify-center rounded-lg border border-admin-button-secondary-border bg-admin-button-secondary-bg text-admin-button-secondary-text transition hover:bg-admin-button-secondary-bg-hover"
    >
      <svg
        className="size-3.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        viewBox="0 0 24 24"
      >
        {direction === "up" ? (
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
        ) : (
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        )}
      </svg>
    </button>
  );
}

function DateTimePicker({
  name,
  value,
  onChange,
}: {
  name: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const parsedValue = value ? new Date(value) : null;
  const fallbackDate = parsedValue && !Number.isNaN(parsedValue.getTime())
    ? parsedValue
    : new Date();
  const [viewYear, setViewYear] = useState(fallbackDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(fallbackDate.getMonth());
  const [selectedDay, setSelectedDay] = useState<{
    year: number;
    month: number;
    day: number;
  } | null>(
    parsedValue && !Number.isNaN(parsedValue.getTime())
      ? {
          year: parsedValue.getFullYear(),
          month: parsedValue.getMonth(),
          day: parsedValue.getDate(),
        }
      : null,
  );
  const [hour, setHour] = useState(
    String(fallbackDate.getHours() % 12 || 12).padStart(2, "0"),
  );
  const [minute, setMinute] = useState(
    String(fallbackDate.getMinutes()).padStart(2, "0"),
  );
  const [ampm, setAmpm] = useState<"AM" | "PM">(
    fallbackDate.getHours() >= 12 ? "PM" : "AM",
  );

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  function emitValue(
    nextDay: { year: number; month: number; day: number } | null,
    nextHour: string,
    nextMinute: string,
    nextAmPm: "AM" | "PM",
  ) {
    if (!nextDay) {
      onChange("");
      return;
    }

    let hours24 = Number.parseInt(nextHour, 10);

    if (nextAmPm === "AM" && hours24 === 12) {
      hours24 = 0;
    } else if (nextAmPm === "PM" && hours24 !== 12) {
      hours24 += 12;
    }

    const nextDate = new Date(
      nextDay.year,
      nextDay.month,
      nextDay.day,
      hours24,
      Number.parseInt(nextMinute, 10),
    );

    onChange(toDateTimeLocal(nextDate));
  }

  function moveMonth(direction: -1 | 1) {
    if (direction === -1) {
      if (viewMonth === 0) {
        setViewMonth(11);
        setViewYear((current) => current - 1);
        return;
      }

      setViewMonth((current) => current - 1);
      return;
    }

    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((current) => current + 1);
      return;
    }

    setViewMonth((current) => current + 1);
  }

  function updateHour(direction: -1 | 1) {
    const numericHour = Number.parseInt(hour, 10);
    const nextHour = (((numericHour - 1 + direction + 12) % 12) + 1)
      .toString()
      .padStart(2, "0");

    setHour(nextHour);
    emitValue(selectedDay, nextHour, minute, ampm);
  }

  function updateMinute(direction: -1 | 1) {
    const numericMinute = Number.parseInt(minute, 10);
    const nextMinute = (((numericMinute + direction * 5) % 60 + 60) % 60)
      .toString()
      .padStart(2, "0");

    setMinute(nextMinute);
    emitValue(selectedDay, hour, nextMinute, ampm);
  }

  function flipAmPm() {
    const nextAmPm = ampm === "AM" ? "PM" : "AM";
    setAmpm(nextAmPm);
    emitValue(selectedDay, hour, minute, nextAmPm);
  }

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;
  const today = new Date();

  function pickDay(day: number) {
    const nextDay = {
      year: viewYear,
      month: viewMonth,
      day,
    };

    setSelectedDay(nextDay);
    emitValue(nextDay, hour, minute, ampm);
  }

  return (
    <div ref={rootRef} className="relative">
      <input type="hidden" name={name} value={value} />
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition ${
          open
            ? "border-field-border-focus bg-field-dark-bg-focus ring-2 ring-accent/20"
            : "border-field-dark-border bg-field-dark-bg hover:border-field-dark-border-hover hover:bg-field-dark-bg-hover"
        }`}
      >
        <span className="min-w-0">
          <span className="block text-xs font-semibold uppercase tracking-[0.16em] text-field-dark-placeholder">
            {name === "startAt" ? "Campaign start" : "Campaign end"}
          </span>
          <span className="mt-1 block truncate text-sm font-semibold text-field-dark-text">
            {formatDateTimeLabel(value)}
          </span>
        </span>
        <svg
          className={`ml-3 size-4 shrink-0 text-field-dark-placeholder transition-transform ${open ? "rotate-180 text-accent" : ""}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open ? (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 rounded-2xl border border-field-dark-border bg-field-dark-panel-bg p-4 text-field-dark-text shadow-[0_24px_70px_var(--shadow-soft)]">
          <div className="grid gap-4">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => moveMonth(-1)}
                className="flex size-8 items-center justify-center rounded-lg border border-admin-button-secondary-border bg-admin-button-secondary-bg text-admin-button-secondary-text transition hover:bg-admin-button-secondary-bg-hover"
              >
                <svg className="size-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <p className="text-sm font-semibold text-field-dark-text">
                {MONTHS[viewMonth]} {viewYear}
              </p>
              <button
                type="button"
                onClick={() => moveMonth(1)}
                className="flex size-8 items-center justify-center rounded-lg border border-admin-button-secondary-border bg-admin-button-secondary-bg text-admin-button-secondary-text transition hover:bg-admin-button-secondary-bg-hover"
              >
                <svg className="size-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center">
              {WEEKDAYS.map((weekday) => (
                <span
                  key={weekday}
                  className="text-[10px] font-semibold uppercase tracking-[0.14em] text-field-dark-placeholder"
                >
                  {weekday}
                </span>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: totalCells }, (_, index) => {
                const day = index - firstDay + 1;
                const valid = day >= 1 && day <= daysInMonth;
                const isToday =
                  today.getFullYear() === viewYear &&
                  today.getMonth() === viewMonth &&
                  today.getDate() === day;
                const isSelected =
                  selectedDay?.year === viewYear &&
                  selectedDay?.month === viewMonth &&
                  selectedDay?.day === day;

                return (
                  <button
                    key={`${viewYear}-${viewMonth}-${index}`}
                    type="button"
                    disabled={!valid}
                    onClick={() => valid && pickDay(day)}
                    className={`flex h-9 items-center justify-center rounded-xl text-xs font-semibold transition ${
                      !valid
                        ? "invisible"
                        : isSelected
                          ? "bg-admin-button-primary-bg text-admin-button-primary-text shadow-[0_12px_24px_var(--glow-accent)]"
                          : isToday
                            ? "border border-admin-card-border bg-admin-surface-hover text-admin-text"
                            : "border border-transparent bg-admin-surface text-admin-text-muted hover:border-admin-card-border-hover hover:bg-admin-surface-hover hover:text-admin-text"
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>

            <div className="grid gap-3 rounded-2xl border border-admin-card-border bg-admin-surface p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-admin-text-muted">
                Time
              </p>
              <div className="flex items-center justify-center gap-3">
                <div className="flex flex-col items-center gap-1">
                  <ChevronButton direction="up" onClick={() => updateHour(1)} />
                  <span className="w-12 rounded-xl bg-admin-card-bg py-2 text-center text-sm font-bold text-admin-text">
                    {hour}
                  </span>
                  <ChevronButton direction="down" onClick={() => updateHour(-1)} />
                </div>
                <span className="text-xl font-bold text-admin-text-muted">:</span>
                <div className="flex flex-col items-center gap-1">
                  <ChevronButton direction="up" onClick={() => updateMinute(1)} />
                  <span className="w-12 rounded-xl bg-admin-card-bg py-2 text-center text-sm font-bold text-admin-text">
                    {minute}
                  </span>
                  <ChevronButton direction="down" onClick={() => updateMinute(-1)} />
                </div>
                <button
                  type="button"
                  onClick={flipAmPm}
                  className="rounded-xl border border-admin-button-secondary-border bg-admin-button-secondary-bg px-3 py-2 text-xs font-bold text-admin-button-secondary-text transition hover:bg-admin-button-secondary-bg-hover"
                >
                  {ampm}
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  const now = new Date();
                  const nextDay = {
                    year: now.getFullYear(),
                    month: now.getMonth(),
                    day: now.getDate(),
                  };
                  setViewYear(now.getFullYear());
                  setViewMonth(now.getMonth());
                  setSelectedDay(nextDay);
                  setHour(String(now.getHours() % 12 || 12).padStart(2, "0"));
                  setMinute(String(now.getMinutes()).padStart(2, "0"));
                  setAmpm(now.getHours() >= 12 ? "PM" : "AM");
                  onChange(toDateTimeLocal(now));
                }}
                className="rounded-full border border-admin-button-secondary-border bg-admin-button-secondary-bg px-3 py-1.5 text-xs font-semibold text-admin-button-secondary-text transition hover:bg-admin-button-secondary-bg-hover"
              >
                Now
              </button>
              <button
                type="button"
                onClick={() => {
                  const next = new Date();
                  next.setDate(next.getDate() + 1);
                  const nextDay = {
                    year: next.getFullYear(),
                    month: next.getMonth(),
                    day: next.getDate(),
                  };
                  setViewYear(next.getFullYear());
                  setViewMonth(next.getMonth());
                  setSelectedDay(nextDay);
                  setHour(String(next.getHours() % 12 || 12).padStart(2, "0"));
                  setMinute(String(next.getMinutes()).padStart(2, "0"));
                  setAmpm(next.getHours() >= 12 ? "PM" : "AM");
                  onChange(toDateTimeLocal(next));
                }}
                className="rounded-full border border-admin-button-secondary-border bg-admin-button-secondary-bg px-3 py-1.5 text-xs font-semibold text-admin-button-secondary-text transition hover:bg-admin-button-secondary-bg-hover"
              >
                +1 day
              </button>
              <AppButton
                type="button"
                onClick={() => setOpen(false)}
                size="sm"
                className="ml-auto rounded-full"
              >
                Apply
              </AppButton>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function PollSelect({
  polls,
  value,
  onChange,
}: {
  polls: VoteCampaignPoll[];
  value: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedPoll = polls.find((poll) => poll.id === value) ?? null;
  const filteredPolls = query.trim()
    ? polls.filter((poll) =>
        poll.title.toLowerCase().includes(query.trim().toLowerCase()),
      )
    : polls;

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  useEffect(() => {
    if (open) {
      window.setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <input type="hidden" name="pollId" value={value} />
      <button
        type="button"
        onClick={() => {
          setOpen((current) => !current);
          if (open) {
            setQuery("");
          }
        }}
        className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition ${
          open
            ? "border-field-border-focus bg-field-dark-bg-focus ring-2 ring-accent/20"
            : "border-field-dark-border bg-field-dark-bg hover:border-field-dark-border-hover hover:bg-field-dark-bg-hover"
        }`}
      >
        <span className="min-w-0">
          <span className="block text-xs font-semibold uppercase tracking-[0.16em] text-field-dark-placeholder">
            Real poll
          </span>
          <span className="mt-1 block truncate text-sm font-semibold text-field-dark-text">
            {selectedPoll?.title ?? "Choose a poll"}
          </span>
        </span>
        <svg
          className={`ml-3 size-4 shrink-0 text-field-dark-placeholder transition-transform ${open ? "rotate-180 text-accent" : ""}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open ? (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-field-dark-border bg-field-dark-panel-bg text-field-dark-text shadow-[0_24px_70px_var(--shadow-soft)]">
          <div className="border-b border-admin-divider p-3">
            <div className="flex items-center gap-2 rounded-xl border border-field-dark-border bg-field-dark-bg px-3 py-2 focus-within:border-field-border-focus focus-within:ring-1 focus-within:ring-accent/20">
              <svg
                className="size-3.5 shrink-0 text-field-dark-placeholder"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <circle cx="11" cy="11" r="8" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35" />
              </svg>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search polls"
                className="w-full bg-transparent text-sm text-field-dark-text placeholder:text-field-dark-placeholder outline-none"
              />
            </div>
          </div>

          <div className="max-h-72 overflow-y-auto p-2 [scrollbar-width:thin]">
            {filteredPolls.length ? (
              filteredPolls.map((poll) => {
                const isSelected = poll.id === value;

                return (
                  <button
                    key={poll.id}
                    type="button"
                    onClick={() => {
                      onChange(poll.id);
                      setOpen(false);
                      setQuery("");
                    }}
                    className={`mb-2 w-full rounded-xl border px-3 py-3 text-left transition last:mb-0 ${
                      isSelected
                        ? "border-admin-card-border-hover bg-admin-nav-active-bg text-admin-nav-active-text"
                        : "border-admin-card-border bg-admin-surface text-admin-text hover:border-admin-card-border-hover hover:bg-admin-surface-hover"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{poll.title}</p>
                        <p className="mt-1 text-xs uppercase tracking-[0.14em] text-admin-text-muted">
                          {poll.status} · {poll.options.length} options
                        </p>
                      </div>
                      {isSelected ? (
                        <span className="grid size-7 shrink-0 place-items-center rounded-full bg-admin-nav-active-bg text-admin-nav-active-text">
                          <svg
                            className="size-3.5"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.4"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </span>
                      ) : null}
                    </div>
                  </button>
                );
              })
            ) : (
              <p className="px-3 py-4 text-sm text-admin-text-muted">
                No polls match that search.
              </p>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function VoteCampaignTask({
  polls,
  mockUserCount,
}: {
  polls: VoteCampaignPoll[];
  mockUserCount: number;
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(createVoteCampaign, initialState);
  const defaultEndAt = new Date();
  const defaultStartAt = new Date(defaultEndAt.getTime() - 1000 * 60 * 60 * 24 * 7);
  const [selectedPollId, setSelectedPollId] = useState(polls[0]?.id ?? "");
  const [optionCounts, setOptionCounts] = useState<Record<string, string>>({});
  const [startAt, setStartAt] = useState(toDateTimeLocal(defaultStartAt));
  const [endAt, setEndAt] = useState(toDateTimeLocal(defaultEndAt));

  const selectedPoll = useMemo(
    () => polls.find((poll) => poll.id === selectedPollId) ?? null,
    [polls, selectedPollId],
  );

  const requestedVotes = selectedPoll?.options.reduce(
    (sum, option) => sum + (Number.parseInt(optionCounts[option.id] || "0", 10) || 0),
    0,
  );

  useEffect(() => {
    if (state.success) {
      router.refresh();
    }
  }, [router, state.success]);

  return (
    <article className="rounded-[1.5rem] border border-admin-card-border bg-admin-card-bg p-5 shadow-[0_18px_50px_var(--shadow-soft)]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-admin-badge-priority-border bg-admin-badge-priority-bg px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-admin-badge-priority-text">
              Real votes
            </span>
            <span className="rounded-full border border-admin-badge-info-border bg-admin-badge-info-bg px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-admin-badge-info-text">
              Mock users only
            </span>
          </div>

          <h2 className="mt-4 text-lg font-semibold text-admin-text">Create vote campaign</h2>
          <p className="mt-2 text-sm leading-6 text-admin-text-muted">
            Choose a real poll, set the vote count for each option, and spread those
            votes across a real time window using only mock user accounts.
          </p>
        </div>

        <div className="grid gap-3 text-sm lg:min-w-[240px]">
          <div className="rounded-2xl border border-admin-card-border bg-admin-surface px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.16em] text-admin-text-muted">
              Eligible mock users
            </p>
            <p className="mt-2 font-semibold text-admin-text">{mockUserCount}</p>
          </div>
          <div className="rounded-2xl border border-admin-card-border bg-admin-surface px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.16em] text-admin-text-muted">
              Stored in
            </p>
            <p className="mt-2 font-semibold text-admin-text">public.votes</p>
          </div>
        </div>
      </div>

      <form action={formAction} className="mt-6 grid gap-4 rounded-[1.25rem] border border-admin-card-border bg-admin-surface p-4">
        <div className="min-w-0 grid gap-4 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)]">
          <div className="min-w-0 sm:col-span-2 lg:col-span-1">
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-admin-text-muted">
              Poll
            </label>
            <PollSelect
              polls={polls}
              value={selectedPollId}
              onChange={(value) => {
                setSelectedPollId(value);
                setOptionCounts({});
              }}
            />
          </div>

          <div className="min-w-0">
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-admin-text-muted">
              Start time
            </label>
            <DateTimePicker name="startAt" value={startAt} onChange={setStartAt} />
          </div>

          <div className="min-w-0">
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-admin-text-muted">
              End time
            </label>
            <DateTimePicker name="endAt" value={endAt} onChange={setEndAt} />
          </div>
        </div>

        {selectedPoll ? (
          <div className="min-w-0 rounded-[1.25rem] border border-admin-card-border bg-admin-card-bg p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-admin-text">{selectedPoll.title}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.16em] text-admin-text-muted">
                  Enter the target votes for each option
                </p>
              </div>
              <span className="rounded-full border border-admin-card-border bg-admin-surface px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-admin-text-muted">
                {selectedPoll.options.length} options
              </span>
            </div>

            <div className="mt-4 grid gap-3">
              {selectedPoll.options.map((option) => (
                <div
                  key={option.id}
                  className="grid gap-3 rounded-2xl border border-admin-card-border bg-admin-surface p-4 lg:grid-cols-[minmax(0,1fr)_160px]"
                >
                  <div>
                    <p className="font-semibold text-admin-text">{option.label}</p>
                    <p className="mt-1 text-sm text-admin-text-muted">{option.description}</p>
                    <p className="mt-2 text-xs uppercase tracking-[0.16em] text-admin-text-subtle">
                      Current votes: {option.vote_count ?? 0}
                    </p>
                  </div>
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-admin-text-muted">
                      Add votes
                    </label>
                    <input
                      name={`option-${option.id}`}
                      type="number"
                      min="0"
                      value={optionCounts[option.id] ?? "0"}
                      onChange={(event) =>
                        setOptionCounts((current) => ({
                          ...current,
                          [option.id]: event.target.value,
                        }))
                      }
                      className="w-full rounded-xl border border-field-dark-border bg-field-dark-bg px-4 py-2.5 text-sm text-field-dark-text outline-none transition placeholder:text-field-dark-placeholder focus:border-field-border-focus focus:ring-2 focus:ring-accent/20"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <div className="min-w-0 flex flex-wrap items-center justify-between gap-3">
          <p className="max-w-md text-sm text-admin-text-muted">
            Each generated vote uses a unique mock user and is tagged with
            `is_mock`, `mock_campaign_id`, and `seed_source`.
          </p>
          <AppButton
            type="submit"
            disabled={pending || !selectedPollId}
          >
            {pending ? "Starting campaign..." : "Start campaign"}
          </AppButton>
        </div>

        {typeof requestedVotes === "number" ? (
          <p className="text-xs text-admin-text-subtle">
            Requested votes in this draft form: {requestedVotes}
          </p>
        ) : null}

        {state.error ? (
          <p className="rounded-2xl border border-admin-card-border bg-admin-surface px-4 py-3 text-sm text-admin-danger-text">
            {state.error}
          </p>
        ) : null}

        {state.success ? (
          <div className="rounded-2xl border border-admin-card-border bg-admin-surface px-4 py-3 text-sm text-admin-success-text">
            <p className="font-semibold text-admin-text">{state.success}</p>
            <div className="mt-2 grid gap-2 sm:grid-cols-3">
              <p>
                <span className="text-admin-success-label-text">Campaign:</span> {state.campaignId}
              </p>
              <p>
                <span className="text-admin-success-label-text">Poll:</span> {state.pollTitle}
              </p>
              <p>
                <span className="text-admin-success-label-text">Votes created:</span> {state.createdCount}
              </p>
            </div>
          </div>
        ) : null}
      </form>
    </article>
  );
}
