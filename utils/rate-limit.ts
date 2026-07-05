import { headers } from "next/headers";

type Entry = { count: number; resetAt: number };

// In-memory store — scoped per serverless instance.
// Protects against rapid-fire attacks within a single process.
// For cross-instance enforcement, replace with a Redis-backed store.
const store = new Map<string, Entry>();

async function getClientIp(): Promise<string> {
  const requestHeaders = await headers();
  return (
    requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    requestHeaders.get("x-real-ip") ??
    "unknown"
  );
}

export async function checkRateLimit(
  action: string,
  limit: number,
  windowMs: number,
  key?: string,
): Promise<{ limited: boolean }> {
  const identifier = key ?? (await getClientIp());
  const storeKey = `${action}:${identifier}`;
  const now = Date.now();
  const entry = store.get(storeKey);

  if (!entry || now > entry.resetAt) {
    store.set(storeKey, { count: 1, resetAt: now + windowMs });
    return { limited: false };
  }

  if (entry.count >= limit) {
    return { limited: true };
  }

  entry.count += 1;
  return { limited: false };
}
