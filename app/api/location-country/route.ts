import { NextResponse } from "next/server";
import { countries, isoToCountry } from "@/utils/countries";

export const dynamic = "force-dynamic";

function countryFromIsoCode(value: string | null) {
  if (!value) return "";

  const country = isoToCountry[value.trim().toUpperCase()];
  return country && countries.includes(country) ? country : "";
}

export async function GET(request: Request) {
  const headers = request.headers;
  const country =
    countryFromIsoCode(headers.get("x-vercel-ip-country")) ||
    countryFromIsoCode(headers.get("cf-ipcountry")) ||
    countryFromIsoCode(headers.get("x-country-code")) ||
    countryFromIsoCode(headers.get("x-appengine-country"));

  return NextResponse.json(
    { country },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
