import { db } from "@/lib/db/client";
import { ownerSubmissions, user, notes } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { AdminSubmissionsView } from "@/components/sections/admin/AdminSubmissionsView";

export const dynamic = "force-dynamic";

export default async function AdminSubmissionsPage() {
  const subs = await db
    .select()
    .from(ownerSubmissions)
    .orderBy(desc(ownerSubmissions.createdAt));

  const staff = await db
    .select({ id: user.id, name: user.name, role: user.role })
    .from(user)
    .where(eq(user.role, "staff"));

  const admin = await db
    .select({ id: user.id, name: user.name, role: user.role })
    .from(user)
    .where(eq(user.role, "admin"));

  const allNotes = await db
    .select()
    .from(notes)
    .where(eq(notes.entityType, "owner_submission"))
    .orderBy(desc(notes.createdAt));

  return (
    <div className="space-y-6">
      <AdminSubmissionsView
        submissions={subs}
        staffUsers={[...staff, ...admin]}
        notes={allNotes}
      />
    </div>
  );
}
