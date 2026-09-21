import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { db } from "../client";
import { user } from "../schema";
import { eq } from "drizzle-orm";
import { auth } from "../../auth/auth";

export async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL || "admin@htc.example";
  const password = process.env.ADMIN_INITIAL_PASSWORD || "AdminPassword2026!";
  const name = process.env.ADMIN_NAME || "HTC Admin";

  console.log(`Checking admin account for ${email}...`);

  const existing = await db.select().from(user).where(eq(user.email, email)).limit(1);

  if (existing.length === 0) {
    console.log(`Creating admin account ${email}...`);
    try {
      // Use Better Auth's signUpEmail
      const res = await auth.api.signUpEmail({
        body: {
          email,
          password,
          name,
        },
      });

      if (res?.user) {
        await db
          .update(user)
          .set({ role: "admin", emailVerified: true })
          .where(eq(user.id, res.user.id));
        console.log(`Successfully created admin user: ${email} (Role: admin)`);
      }
    } catch (err) {
      console.error("Error creating admin account via Better Auth:", err);
      throw err;
    }
  } else {
    // Ensure role is admin
    await db
      .update(user)
      .set({ role: "admin" })
      .where(eq(user.id, existing[0].id));
    console.log(`Admin account already exists for ${email}. Ensured role is 'admin'.`);
  }
}

if (require.main === module || process.argv[1]?.includes("admin.ts")) {
  seedAdmin()
    .then(() => {
      console.log("Admin seed completed.");
      process.exit(0);
    })
    .catch((err) => {
      console.error("Admin seed failed:", err);
      process.exit(1);
    });
}
