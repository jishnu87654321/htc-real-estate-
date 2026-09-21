import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/lib/db/client";
import * as schema from "@/lib/db/schema";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "user",
        input: false,
      },
      phone: {
        type: "string",
        required: false,
      },
      disabled: {
        type: "boolean",
        required: false,
        defaultValue: false,
        input: false,
      },
      lastLoginAt: {
        type: "date",
        required: false,
      },
    },
  },
  baseURL:
    process.env.BETTER_AUTH_URL ||
    (process.env.PORT ? `http://localhost:${process.env.PORT}` : "http://localhost:3000"),
  trustedOrigins: [
    "http://localhost:3000",
    "http://localhost:3030",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3030",
  ],
  secret:
    process.env.BETTER_AUTH_SECRET ||
    (process.env.NODE_ENV === "production"
      ? (() => {
          throw new Error("CRITICAL SECURITY ERROR: BETTER_AUTH_SECRET environment variable is required.");
        })()
      : "htc_dev_fallback_secret_32_bytes_min_length_local_only"),
});

export type AuthSession = typeof auth.$Infer.Session;
