import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { auth } from "./auth";
import { db } from "@/lib/db/client";
import { user } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function getServerSession() {
  const reqHeaders = await headers();
  const session = await auth.api.getSession({
    headers: reqHeaders,
  });

  if (!session?.user) {
    return null;
  }

  // Fetch full user record from database to check disabled flag and updated role
  const [currentUser] = await db
    .select()
    .from(user)
    .where(eq(user.id, session.user.id))
    .limit(1);

  if (!currentUser || currentUser.disabled) {
    return null;
  }

  return {
    ...session,
    user: currentUser,
  };
}

export async function requireUser(returnTo?: string) {
  const session = await getServerSession();
  if (!session) {
    const destination = returnTo ? `/login?returnTo=${encodeURIComponent(returnTo)}` : "/login";
    redirect(destination);
  }
  return session;
}

export async function requireRole(allowedRoles: Array<"user" | "staff" | "admin">, returnTo?: string) {
  const session = await getServerSession();
  
  if (!session) {
    // If accessing admin, return 404 to avoid leaking admin surface existence to non-auth
    if (allowedRoles.includes("staff") || allowedRoles.includes("admin")) {
      const destination = returnTo ? `/login?returnTo=${encodeURIComponent(returnTo)}` : "/login";
      redirect(destination);
    }
    redirect("/login");
  }

  if (!allowedRoles.includes(session.user.role as "user" | "staff" | "admin")) {
    // Non-staff hitting admin receives 404
    if (!["staff", "admin"].includes(session.user.role)) {
      notFound();
    }
    throw new Error("Forbidden: You do not have permission to access this resource.");
  }

  return session;
}
