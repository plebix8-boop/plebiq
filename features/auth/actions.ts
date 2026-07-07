"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { isoToCountry } from "@/utils/countries";
import { checkRateLimit } from "@/utils/rate-limit";
import { getAuthCallbackUrl } from "@/utils/site-url";
import type { AuthFormState } from "./types";

function normalizeEmail(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function normalizePassword(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value : "";
}

function normalizeName(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function validateCredentials(email: string, password: string) {
  if (!email) {
    return "Email is required.";
  }

  if (!email.includes("@")) {
    return "Enter a valid email address.";
  }

  if (!password) {
    return "Password is required.";
  }

  if (password.length < 8) {
    return "Password must be at least 8 characters long.";
  }

  return null;
}

function validateEmail(email: string) {
  if (!email) {
    return "Email is required.";
  }

  if (!email.includes("@")) {
    return "Enter a valid email address.";
  }

  return null;
}

type ExistingAuthAccount = {
  hasEmail: boolean;
  hasFacebook: boolean;
  hasGoogle: boolean;
};

async function findExistingAuthAccount(email: string): Promise<ExistingAuthAccount | null> {
  try {
    const supabase = createAdminClient();
    const normalizedEmail = email.toLowerCase();

    for (let page = 1; page <= 10; page += 1) {
      const { data, error } = await supabase.auth.admin.listUsers({
        page,
        perPage: 1000,
      });

      if (error) {
        return null;
      }

      const user = data.users.find(
        (candidate) => candidate.email?.toLowerCase() === normalizedEmail,
      );

      if (user) {
        const providers = new Set(
          [
            user.app_metadata.provider,
            ...(Array.isArray(user.app_metadata.providers)
              ? user.app_metadata.providers
              : []),
            ...(user.identities?.map((identity) => identity.provider) ?? []),
          ].filter((provider): provider is string => typeof provider === "string"),
        );

        return {
          hasEmail: providers.has("email"),
          hasFacebook: providers.has("facebook"),
          hasGoogle: providers.has("google"),
        };
      }

      if (data.users.length < 1000) {
        break;
      }
    }
  } catch {
    return null;
  }

  return null;
}

function existingAccountSignUpMessage(account: ExistingAuthAccount) {
  if (account.hasFacebook && !account.hasEmail && !account.hasGoogle) {
    return "Looks like you already have an account with this email. Continue with Facebook to sign in.";
  }

  if (account.hasGoogle && !account.hasEmail) {
    return "Looks like you already have an account with this email. Continue with Google to sign in.";
  }

  if ((account.hasFacebook || account.hasGoogle) && account.hasEmail) {
    return "Looks like you already have an account with this email. Sign in or continue with your social login.";
  }

  return "Looks like you already have an account with this email. Sign in to continue.";
}

export async function signIn(
  _previousState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const { limited } = await checkRateLimit("sign-in", 5, 60_000);
  if (limited) {
    return { error: "Too many sign-in attempts. Please wait a minute and try again." };
  }

  const email = normalizeEmail(formData.get("email"));
  const password = normalizePassword(formData.get("password"));
  const validationError = validateCredentials(email, password);

  if (validationError) {
    return { error: validationError };
  }

  const existingAccount = await findExistingAuthAccount(email);
  const shouldGuideToFacebook =
    existingAccount?.hasFacebook && !existingAccount.hasEmail;
  const shouldGuideToGoogle =
    existingAccount?.hasGoogle && !existingAccount.hasEmail;

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    if (shouldGuideToFacebook) {
      return {
        info: "This email is connected with Facebook. Continue with Facebook to sign in.",
      };
    }

    if (shouldGuideToGoogle) {
      return {
        info: "This email is connected with Google. Continue with Google to sign in.",
      };
    }

    return { error: error.message };
  }

  const { data: { user: signedInUser } } = await supabase.auth.getUser();
  const role = typeof signedInUser?.app_metadata?.role === "string" ? signedInUser.app_metadata.role : "user";
  redirect(role === "admin" ? "/admin/polls" : "/");
}

export async function signUp(
  _previousState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const { limited } = await checkRateLimit("sign-up", 3, 60_000);
  if (limited) {
    return { error: "Too many sign-up attempts. Please wait a minute and try again." };
  }

  const name = normalizeName(formData.get("name"));
  const email = normalizeEmail(formData.get("email"));
  const password = normalizePassword(formData.get("password"));
  const validationError = validateCredentials(email, password);

  if (validationError) {
    return { error: validationError };
  }

  const existingAccount = await findExistingAuthAccount(email);
  if (existingAccount) {
    return { info: existingAccountSignUpMessage(existingAccount) };
  }

  let country = normalizeName(formData.get("country"));
  if (!country) {
    const requestHeaders = await headers();
    const code = requestHeaders.get("x-vercel-ip-country");
    country = (code && isoToCountry[code]) || "";
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        role: "user",
        ...(name ? { full_name: name } : {}),
        ...(country ? { country } : {}),
      },
      emailRedirectTo: getAuthCallbackUrl(),
    },
  });

  if (error) {
    return { error: error.message };
  }

  return {
    success:
      "Account created. Check your email for the confirmation link, then sign in.",
  };
}

export async function requestPasswordReset(
  _previousState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const { limited } = await checkRateLimit("password-reset", 3, 60_000);
  if (limited) {
    return { error: "Too many reset attempts. Please wait a minute and try again." };
  }

  const email = normalizeEmail(formData.get("email"));
  const validationError = validateEmail(email);

  if (validationError) {
    return { error: validationError };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: getAuthCallbackUrl(),
  });

  if (error) {
    return { error: error.message };
  }

  return {
    success: "Password reset link sent. Check your email to continue.",
  };
}

export async function updatePassword(
  _previousState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const password = normalizePassword(formData.get("password"));
  const confirmPassword = normalizePassword(formData.get("confirmPassword"));

  if (!password) {
    return { error: "New password is required." };
  }

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters long." };
  }

  if (password !== confirmPassword) {
    return { error: "Passwords do not match." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    password,
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
