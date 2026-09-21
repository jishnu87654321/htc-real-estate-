import { db } from "@/lib/db/client";
import { auditLog } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { ShieldCheck } from "lucide-react";
import { requireRole } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function AdminActivityPage() {
  await requireRole(["admin"], "/admin/activity");
  const logs = await db
    .select()
    .from(auditLog)
    .orderBy(desc(auditLog.createdAt))
    .limit(100);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-display-sm text-text-primary">Security & Audit Trail</h1>
        <p className="text-body-sm text-text-secondary mt-1">
          Immutable audit log of staff transitions, state machine automations, and administrative security events.
        </p>
      </div>

      <div className="rounded-2xl border border-border-subtle bg-surface-raised shadow-sm overflow-hidden">
        <table className="w-full text-left text-body-sm">
          <thead className="bg-surface-sunken border-b border-border-subtle text-body-xs uppercase text-text-secondary">
            <tr>
              <th className="px-4 py-3">Timestamp</th>
              <th className="px-4 py-3">Actor</th>
              <th className="px-4 py-3">Action</th>
              <th className="px-4 py-3">Entity</th>
              <th className="px-4 py-3">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle font-mono text-body-xs">
            {logs.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-text-tertiary">
                  No audit logs recorded yet.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="hover:bg-surface-sunken">
                  <td className="px-4 py-3 text-text-tertiary whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 font-sans font-medium text-text-primary">
                    {log.actorName}
                  </td>
                  <td className="px-4 py-3 text-red-600 font-bold">{log.action}</td>
                  <td className="px-4 py-3 text-text-secondary capitalize">{log.entityType || "—"}</td>
                  <td className="px-4 py-3 text-text-secondary max-w-md truncate">
                    {JSON.stringify(log.detailsJson)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
