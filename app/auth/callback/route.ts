import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { countries, isoToCountry } from "@/utils/countries";

function validCountry(country: string | null | undefined) {
  return country && countries.includes(country) ? country : "";
}

function countryFromIsoCode(value: string | null) {
  if (!value) return "";

  return validCountry(isoToCountry[value.trim().toUpperCase()]);
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const tokenHash = requestUrl.searchParams.get("token_hash");
  const type = requestUrl.searchParams.get("type");
  const callbackCountry = validCountry(requestUrl.searchParams.get("country"));
  const redirectPath = type === "recovery" ? "/auth/reset-password" : "/";

  const supabase = await createClient();

  if (code) {
    await supabase.auth.exchangeCodeForSession(code);

    const { data: { user } } = await supabase.auth.getUser();
    if (user && !user.user_metadata?.country) {
      const headersList = await headers();
      const country =
        callbackCountry ||
        countryFromIsoCode(headersList.get("x-vercel-ip-country")) ||
        countryFromIsoCode(headersList.get("cf-ipcountry")) ||
        countryFromIsoCode(headersList.get("x-country-code")) ||
        countryFromIsoCode(headersList.get("x-appengine-country"));

      if (country) {
        await supabase.auth.updateUser({ data: { country } });
      }
    }
  }

  if (tokenHash && (type === "email" || type === "recovery")) {
    await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type,
    });
  }

  return NextResponse.redirect(new URL(redirectPath, requestUrl.origin));
}
