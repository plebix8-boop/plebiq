"use client";

import { useEffect, useState } from "react";
import { AppSelect } from "@/components/form-controls";
import { countries, isoToCountry } from "@/utils/countries";

type CountrySelectProps = {
  name?: string;
  id?: string;
};

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

function guessCountryFromTimeZone() {
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return validCountry(timeZone ? timeZoneCountryHints[timeZone] : "");
}

function guessCountryFromLocale() {
  const locale =
    navigator.languages?.find((value) => value.includes("-")) ??
    navigator.language;
  const region = locale?.split("-").pop()?.toUpperCase();
  const localeCountry = region ? isoToCountry[region] : null;

  return validCountry(localeCountry);
}

async function getCountryFromIp() {
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

const countryOptions = countries.map((country) => ({
  value: country,
  label: country,
}));

export function CountrySelect({
  name = "country",
  id = "sign-up-country",
}: CountrySelectProps) {
  const [selected, setSelected] = useState("");

  useEffect(() => {
    let alive = true;

    async function selectInitialCountry() {
      const timeZoneCountry = guessCountryFromTimeZone();

      if (timeZoneCountry) {
        setSelected(timeZoneCountry);
        return;
      }

      const ipCountry = await getCountryFromIp();

      if (!alive) {
        return;
      }

      setSelected(ipCountry || guessCountryFromLocale());
    }

    void selectInitialCountry();

    return () => {
      alive = false;
    };
  }, []);

  return (
    <AppSelect
      id={id}
      name={name}
      value={selected}
      onChange={setSelected}
      options={countryOptions}
      placeholder="Select your country"
      searchThreshold={0}
      tone="light"
    />
  );
}
