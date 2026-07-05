"use client";

import { useState } from "react";
import { AppInput } from "@/components/form-controls";

type PasswordInputProps = {
  id: string;
  name: string;
  autoComplete?: string;
  placeholder?: string;
  required?: boolean;
};

function EyeIcon() {
  return (
    <svg className="size-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg className="size-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" strokeLinecap="round" strokeLinejoin="round" />
      <line strokeLinecap="round" strokeLinejoin="round" x1="1" x2="23" y1="1" y2="23" />
    </svg>
  );
}

export function PasswordInput({ id, name, autoComplete, placeholder, required }: PasswordInputProps) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative">
      <AppInput
        id={id}
        name={name}
        type={show ? "text" : "password"}
        autoComplete={autoComplete}
        placeholder={placeholder}
        required={required}
        className="pr-11"
      />
      <button
        aria-label={show ? "Hide password" : "Show password"}
        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
        onClick={() => setShow((s) => !s)}
        tabIndex={-1}
        type="button"
      >
        {show ? <EyeOffIcon /> : <EyeIcon />}
      </button>
    </div>
  );
}
