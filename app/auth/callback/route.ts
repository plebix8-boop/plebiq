import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { countries, isoToCountry } from "@/utils/countries";
import { getSiteUrl } from "@/utils/site-url";

export const dynamic = "force-dynamic";

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
  const redirectUrl = new URL(redirectPath, getSiteUrl());

  const supabase = await createClient();

  try {
    if (code) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) {
        console.error("[auth/callback] OAuth code exchange failed:", error.message);
        return NextResponse.redirect(new URL("/auth/sign-in", getSiteUrl()));
      }

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.error("[auth/callback] User lookup after OAuth failed:", userError.message);
      }

      if (user && !user.user_metadata?.country) {
        const headersList = await headers();
        const country =
          callbackCountry ||
          countryFromIsoCode(headersList.get("x-vercel-ip-country")) ||
          countryFromIsoCode(headersList.get("cf-ipcountry")) ||
          countryFromIsoCode(headersList.get("x-country-code")) ||
          countryFromIsoCode(headersList.get("x-appengine-country"));

        if (country) {
          const { error: updateError } = await supabase.auth.updateUser({
            data: { country },
          });

          if (updateError) {
            console.error("[auth/callback] Country update failed:", updateError.message);
          }
        }
      }
    }

    if (tokenHash && (type === "email" || type === "recovery")) {
      const { error } = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type,
      });

      if (error) {
        console.error("[auth/callback] OTP verification failed:", error.message);
        return NextResponse.redirect(new URL("/auth/sign-in", getSiteUrl()));
      }
    }
  } catch (error) {
    console.error("[auth/callback] Unexpected callback failure:", error);
    return NextResponse.redirect(new URL("/auth/sign-in", getSiteUrl()));
  }

  return NextResponse.redirect(redirectUrl);
}
