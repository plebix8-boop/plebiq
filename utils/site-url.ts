const DEFAULT_SITE_URL = "http://localhost:3000";

export function getSiteUrl() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  return (siteUrl || DEFAULT_SITE_URL).replace(/\/+$/, "");
}

export function getAuthCallbackUrl() {
  return `${getSiteUrl()}/auth/callback`;
}
