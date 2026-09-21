import { db } from "@/lib/db/client";
import { user } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { AdminUsersView } from "@/components/sections/admin/AdminUsersView";
import { requireRole } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  await requireRole(["admin"], "/admin/users");
  const allUsers = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      disabled: user.disabled,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
    })
    .from(user)
    .orderBy(desc(user.createdAt));

  return (
    <div className="space-y-6">
      <AdminUsersView users={allUsers} />
    </div>
  );
}
