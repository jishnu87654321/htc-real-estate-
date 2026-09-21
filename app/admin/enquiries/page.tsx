import { db } from "@/lib/db/client";
import { enquiries, user, notes, statusEvents } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { AdminEnquiriesView } from "@/components/sections/admin/AdminEnquiriesView";

export const dynamic = "force-dynamic";

export default async function AdminEnquiriesPage() {
  const allEnquiries = await db
    .select()
    .from(enquiries)
    .orderBy(desc(enquiries.createdAt));

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
    .where(eq(notes.entityType, "enquiry"))
    .orderBy(desc(notes.createdAt));

  return (
    <div className="space-y-6">
      <AdminEnquiriesView
        enquiries={allEnquiries}
        staffUsers={[...staff, ...admin]}
        notes={allNotes}
      />
    </div>
  );
}
