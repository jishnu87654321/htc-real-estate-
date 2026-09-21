"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search, Calendar, Phone, Check, XCircle } from "lucide-react";
import { Button } from "@/components/primitives/Button";
import { adminUpdateWalkthroughStatusAction } from "@/app/actions/admin";

interface WalkthroughRecord {
  id: string;
  reference: string;
  name: string;
  phone: string;
  email: string | null;
  communityName: string;
  numberOfHomes: number | null;
  role: string | null;
  city: string;
  status: string;
  scheduledAt: Date | null;
  createdAt: Date;
}

export function AdminWalkthroughsView({ requests }: { requests: WalkthroughRecord[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState<WalkthroughRecord | null>(null);
  const [scheduledDate, setScheduledDate] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleUpdate = (status: "scheduled" | "completed" | "won" | "lost") => {
    if (!selected) return;
    startTransition(async () => {
      const res = await adminUpdateWalkthroughStatusAction({
        walkthroughId: selected.id,
        status,
        scheduledAt: scheduledDate ? new Date(scheduledDate).toISOString() : undefined,
      });
      if (res.success) {
        router.refresh();
        if (res.walkthrough) setSelected(res.walkthrough as any);
      }
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-display-sm text-text-primary">Society Walkthrough Requests</h1>
        <p className="text-body-sm text-text-secondary mt-1">
          Coordinate society visits, audit presentations, and facility onboarding.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 items-start">
        <div className="rounded-2xl border border-border-subtle bg-surface-raised shadow-sm overflow-hidden">
          <table className="w-full text-left text-body-sm">
            <thead className="bg-surface-sunken border-b border-border-subtle text-body-xs uppercase text-text-secondary">
              <tr>
                <th className="px-4 py-3">Reference</th>
                <th className="px-4 py-3">Community</th>
                <th className="px-4 py-3">Representative</th>
                <th className="px-4 py-3">Homes</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {requests.map((r) => (
                <tr
                  key={r.id}
                  onClick={() => {
                    setSelected(r);
                    setScheduledDate(r.scheduledAt ? new Date(r.scheduledAt).toISOString().slice(0, 16) : "");
                  }}
                  className={`cursor-pointer ${selected?.id === r.id ? "bg-red-50/60" : "hover:bg-surface-sunken"}`}
                >
                  <td className="px-4 py-3 font-mono font-bold text-text-primary">{r.reference}</td>
                  <td className="px-4 py-3 font-medium text-text-primary">{r.communityName}</td>
                  <td className="px-4 py-3">
                    <p>{r.name}</p>
                    <p className="text-body-xs text-text-tertiary">{r.phone}</p>
                  </td>
                  <td className="px-4 py-3">{r.numberOfHomes || "N/A"}</td>
                  <td className="px-4 py-3 capitalize">{r.status}</td>
                  <td className="px-4 py-3 text-right text-red-600 font-semibold">Schedule →</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {selected ? (
          <div className="rounded-2xl border border-border-subtle bg-surface-raised p-6 shadow-md space-y-4">
            <h3 className="text-title-sm font-bold text-text-primary">{selected.communityName}</h3>
            <p className="text-body-xs text-text-secondary">{selected.name} ({selected.role || "RWA Member"})</p>
            <p className="text-body-xs text-text-secondary">Phone: {selected.phone}</p>

            <div className="border-t border-border-subtle pt-4 space-y-3">
              <label className="block text-body-xs font-semibold text-text-tertiary uppercase">
                Schedule Society Walkthrough
              </label>
              <input
                type="datetime-local"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full rounded-lg border border-border-strong bg-surface-base px-3 py-2 text-body-sm"
              />
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleUpdate("scheduled")}
                disabled={isPending}
                className="w-full justify-center"
              >
                Save Schedule
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
