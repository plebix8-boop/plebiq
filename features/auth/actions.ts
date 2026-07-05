"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { isoToCountry } from "@/utils/countries";
import { checkRateLimit } from "@/utils/rate-limit";
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

async function getAuthOrigin() {
  const requestHeaders = await headers();
  return requestHeaders.get("origin") ?? "http://localhost:3000";
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

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
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

  let country = normalizeName(formData.get("country"));
  if (!country) {
    const requestHeaders = await headers();
    const code = requestHeaders.get("x-vercel-ip-country");
    country = (code && isoToCountry[code]) || "";
  }

  const origin = await getAuthOrigin();
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
      emailRedirectTo: `${origin}/auth/callback`,
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
  const origin = await getAuthOrigin();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback`,
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
