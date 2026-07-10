"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { countries, isoToCountry } from "@/utils/countries";
import { getAuthCallbackUrl } from "@/utils/site-url";

type Provider = "facebook" | "google";

type SocialLoginButtonsProps = {
  mode?: "sign-in" | "sign-up";
};

function GoogleIcon() {
  return (
    <svg className="size-4 shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="var(--provider-google)"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="var(--success)"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
        fill="var(--warning)"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="var(--danger)"
      />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg className="size-4 shrink-0" viewBox="0 0 24 24" fill="var(--provider-facebook)" xmlns="http://www.w3.org/2000/svg">
      <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.413c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.265h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
    </svg>
  );
}

const timeZoneCountryHints: Record<string, string> = {
  "Asia/Karachi": "Pakistan",
  "Asia/Dubai": "United Arab Emirates",
  "Asia/Kolkata": "India",
  "Asia/Riyadh": "Saudi Arabia",
  "Europe/London": "United Kingdom",
  "America/New_York": "United States",
  "America/Chicago": "United States",
  "America/Denver": "United States",
  "America/Los_Angeles": "United States",
  "America/Toronto": "Canada",
  "America/Vancouver": "Canada",
  "Australia/Sydney": "Australia",
};

function validCountry(country: string | null | undefined) {
  return country && countries.includes(country) ? country : "";
}

function countryFromTimeZone() {
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return validCountry(timeZone ? timeZoneCountryHints[timeZone] : "");
}

function countryFromLocale() {
  const locale =
    navigator.languages?.find((value) => value.includes("-")) ??
    navigator.language;
  const region = locale?.split("-").pop()?.toUpperCase();
  return validCountry(region ? isoToCountry[region] : "");
}

async function countryFromIp() {
  try {
    const appResponse = await fetch("/api/location-country", {
      cache: "no-store",
    });
    const appData = (await appResponse.json()) as { country?: string };
    const appCountry = validCountry(appData.country);

    if (appCountry) {
      return appCountry;
    }
  } catch {
    // Fall through to the public IP lookup.
  }

  try {
    const publicResponse = await fetch("https://ipapi.co/json/", {
      cache: "no-store",
    });
    const publicData = (await publicResponse.json()) as {
      country_code?: string;
    };
    const publicCountry = publicData.country_code
      ? isoToCountry[publicData.country_code.toUpperCase()]
      : "";

    return validCountry(publicCountry);
  } catch {
    return "";
  }
}

async function detectCountryForOAuth() {
  return countryFromTimeZone() || (await countryFromIp()) || countryFromLocale();
}

export function SocialLoginButtons({ mode = "sign-in" }: SocialLoginButtonsProps) {
  const [loadingProvider, setLoadingProvider] = useState<Provider | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSocialLogin(provider: Provider) {
    setLoadingProvider(provider);
    setError(null);
    const supabase = createClient();
    const callbackUrl = new URL(getAuthCallbackUrl());
    const country = await detectCountryForOAuth();

    if (country) {
      callbackUrl.searchParams.set("country", country);
    }

    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: callbackUrl.toString() },
    });
    if (authError) {
      setError(authError.message);
      setLoadingProvider(null);
    }
  }

  const googleLabel = loadingProvider === "google" ? "Redirecting…" : "Google";
  const displayedGoogleLabel =
    loadingProvider === "google" ? googleLabel : "Google";
  const heading = mode === "sign-up" ? "Start with" : "Continue with";

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">{heading}</p>
      <div className="grid gap-2.5 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => handleSocialLogin("google")}
          disabled={loadingProvider !== null}
          className="inline-flex items-center justify-center gap-2.5 rounded-xl border border-button-secondary-border bg-button-secondary-bg px-4 py-3 text-sm font-semibold text-button-secondary-text shadow-sm transition duration-150 hover:-translate-y-0.5 hover:border-accent/40 hover:bg-button-secondary-bg-hover hover:shadow-md disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:translate-y-0"
        >
          <GoogleIcon />
          {displayedGoogleLabel}
        </button>

        <button
          type="button"
          disabled
          className="inline-flex cursor-not-allowed items-center justify-center gap-2.5 rounded-xl border border-button-secondary-border bg-button-secondary-bg px-4 py-3 text-sm font-semibold text-button-secondary-text opacity-55 shadow-sm"
        >
          <FacebookIcon />
          coming soon
        </button>
      </div>

      {error && (
        <p className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
