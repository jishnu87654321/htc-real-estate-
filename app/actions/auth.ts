"use server";

import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { loginSchema, signupSchema, getSafeReturnTo } from "@/lib/validation/forms";
import { checkRateLimit, isRateLimited, resetRateLimit, getClientIpHash } from "@/lib/utils/rate-limit";
import { db } from "@/lib/db/client";
import { user } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function loginAction(formData: unknown) {
  const parsed = loginSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Invalid input" };
  }

  const { ipHash } = await getClientIpHash();
  const rateLimitKey = `auth_fail:${ipHash}`;

  // Check if IP is already locked out (without incrementing on attempt)
  const rateStatus = await isRateLimited(rateLimitKey, 5);
  if (!rateStatus.allowed) {
    return {
      success: false,
      error: "Too many failed login attempts. Please wait 15 minutes before trying again.",
    };
  }

  try {
    const reqHeaders = await headers();
    const result = await auth.api.signInEmail({
      body: {
        email: parsed.data.email,
        password: parsed.data.password,
      },
      headers: reqHeaders,
    });

    if (result?.user) {
      // On successful login, clear any previous failure counter
      await resetRateLimit(rateLimitKey);

      // Update last login timestamp
      await db
        .update(user)
        .set({ lastLoginAt: new Date() })
        .where(eq(user.id, result.user.id));

      const fallback = result.user.role === "admin" || result.user.role === "staff" ? "/admin" : "/account";
      const destination = getSafeReturnTo(parsed.data.returnTo, fallback);

      return {
        success: true,
        user: result.user,
        returnTo: destination,
      };
    }

    // Login failed: increment failure counter
    await checkRateLimit(rateLimitKey, 5, 15 * 60);
    return { success: false, error: "Invalid email or password." };
  } catch (err: unknown) {
    // Increment failure counter on exception
    await checkRateLimit(rateLimitKey, 5, 15 * 60);
    const errorMsg = err instanceof Error ? err.message : "Invalid email or password.";
    return { success: false, error: errorMsg };
  }
}

export async function signupAction(formData: unknown) {
  const parsed = signupSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Invalid input" };
  }

  const { ipHash } = await getClientIpHash();
  const rateCheck = await checkRateLimit(`signup:${ipHash}`, 5, 60 * 60);

  if (!rateCheck.allowed) {
    return {
      success: false,
      error: "Too many sign up requests from this network. Please try again later.",
    };
  }

  try {
    const reqHeaders = await headers();
    const result = await auth.api.signUpEmail({
      body: {
        name: parsed.data.name,
        email: parsed.data.email,
        password: parsed.data.password,
      },
      headers: reqHeaders,
    });

    if (result?.user) {
      if (parsed.data.phone) {
        await db
          .update(user)
          .set({ phone: parsed.data.phone })
          .where(eq(user.id, result.user.id));
      }

      const destination = getSafeReturnTo(parsed.data.returnTo, "/account");

      return {
        success: true,
        user: result.user,
        returnTo: destination,
      };
    }

    return { success: false, error: "Could not complete signup. Please try again." };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Could not sign up. Email may already be in use.";
    return { success: false, error: errorMsg };
  }
}

export async function logoutAction() {
  const reqHeaders = await headers();
  await auth.api.signOut({
    headers: reqHeaders,
  });
  return { success: true };
}

