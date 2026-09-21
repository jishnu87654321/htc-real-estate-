import { createHash } from "crypto";
import { headers } from "next/headers";
import { db } from "@/lib/db/client";
import { rateLimits } from "@/lib/db/schema";
import { sql, lt, eq, and, gt } from "drizzle-orm";

const SALT =
  process.env.IP_HASH_SALT ||
  (process.env.NODE_ENV === "production"
    ? (() => {
        throw new Error("CRITICAL SECURITY ERROR: IP_HASH_SALT environment variable is required.");
      })()
    : "htc_dev_ip_salt_fallback_key_2026");

export async function getClientIpHash(): Promise<{ ip: string; ipHash: string }> {
  const reqHeaders = await headers();
  const forwardedFor = reqHeaders.get("x-forwarded-for");
  const realIp = reqHeaders.get("x-real-ip");

  let ip = "127.0.0.1";
  if (forwardedFor) {
    ip = forwardedFor.split(",")[0].trim();
  } else if (realIp) {
    ip = realIp.trim();
  }

  const ipHash = createHash("sha256").update(`${SALT}:${ip}`).digest("hex");
  return { ip, ipHash };
}

/**
 * Checks if key has already exceeded rate limit without incrementing.
 */
export async function isRateLimited(key: string, limit: number): Promise<{ allowed: boolean; remaining: number }> {
  const now = new Date();
  const [record] = await db
    .select()
    .from(rateLimits)
    .where(and(eq(rateLimits.key, key), gt(rateLimits.expiresAt, now)))
    .limit(1);

  if (!record) {
    return { allowed: true, remaining: limit };
  }

  return {
    allowed: record.hits < limit,
    remaining: Math.max(0, limit - record.hits),
  };
}

/**
 * Resets / clears a rate limit key (e.g. after successful login).
 */
export async function resetRateLimit(key: string): Promise<void> {
  await db.delete(rateLimits).where(eq(rateLimits.key, key)).catch(() => {});
}

/**
 * Checks and increments rate limit counter in a single step.
 * Returns true if allowed, false if limit exceeded.
 */
export async function checkRateLimit(
  key: string,
  limit: number,
  windowSeconds: number
): Promise<{ allowed: boolean; remaining: number; resetAt: Date }> {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + windowSeconds * 1000);

  // Clean up expired records occasionally
  await db.delete(rateLimits).where(lt(rateLimits.expiresAt, now)).catch(() => {});

  const result = await db
    .insert(rateLimits)
    .values({
      key,
      hits: 1,
      windowStart: now,
      expiresAt,
    })
    .onConflictDoUpdate({
      target: rateLimits.key,
      set: {
        hits: sql`CASE WHEN ${rateLimits.expiresAt} < ${now} THEN 1 ELSE ${rateLimits.hits} + 1 END`,
        windowStart: sql`CASE WHEN ${rateLimits.expiresAt} < ${now} THEN ${now} ELSE ${rateLimits.windowStart} END`,
        expiresAt: sql`CASE WHEN ${rateLimits.expiresAt} < ${now} THEN ${expiresAt} ELSE ${rateLimits.expiresAt} END`,
      },
    })
    .returning({
      hits: rateLimits.hits,
      expiresAt: rateLimits.expiresAt,
    });

  const record = result[0];
  const hits = record ? record.hits : 1;
  const allowed = hits <= limit;
  const remaining = Math.max(0, limit - hits);

  return {
    allowed,
    remaining,
    resetAt: record?.expiresAt || expiresAt,
  };
}

