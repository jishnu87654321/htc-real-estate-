import { db } from "@/lib/db/client";
import { referenceCounters } from "@/lib/db/schema";
import { sql } from "drizzle-orm";

/**
 * Generates an atomic sequential reference number.
 * Format: [PREFIX]-[YY]-[000000] (e.g. APP-26-000001, Q-26-000001, L-26-000001, W-26-000001)
 */
export async function generateReference(prefix: "APP" | "Q" | "L" | "W"): Promise<string> {
  const currentYear = new Date().getFullYear() % 100; // e.g. 26

  const result = await db
    .insert(referenceCounters)
    .values({
      prefix,
      year: currentYear,
      currentVal: 1,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [referenceCounters.prefix, referenceCounters.year],
      set: {
        currentVal: sql`${referenceCounters.currentVal} + 1`,
        updatedAt: new Date(),
      },
    })
    .returning({ currentVal: referenceCounters.currentVal });

  const seq = result[0]?.currentVal || 1;
  const paddedSeq = String(seq).padStart(6, "0");
  return `${prefix}-${currentYear}-${paddedSeq}`;
}
