import { db } from "@/lib/db/client";
import { walkthroughRequests } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { AdminWalkthroughsView } from "@/components/sections/admin/AdminWalkthroughsView";

export const dynamic = "force-dynamic";

export default async function AdminWalkthroughsPage() {
  const requests = await db
    .select()
    .from(walkthroughRequests)
    .orderBy(desc(walkthroughRequests.createdAt));

  return (
    <div className="space-y-6">
      <AdminWalkthroughsView requests={requests} />
    </div>
  );
}
