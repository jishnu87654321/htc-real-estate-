"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search, Phone, MessageCircle, X, Check, XCircle } from "lucide-react";
import { Button } from "@/components/primitives/Button";
import {
  adminUpdateSubmissionStatusAction,
  adminAddNoteAction,
} from "@/app/actions/admin";

interface SubmissionRecord {
  id: string;
  reference: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  locality: string;
  city: string;
  communityName: string | null;
  bhk: number | null;
  price: number;
  status: string;
  createdListingId: string | null;
  createdAt: Date;
}

export function AdminSubmissionsView({
  submissions,
  staffUsers,
  notes,
}: {
  submissions: SubmissionRecord[];
  staffUsers: { id: string; name: string; role: string }[];
  notes: { id: string; entityId: string; authorName: string; noteText: string; createdAt: Date }[];
}) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSub, setSelectedSub] = useState<SubmissionRecord | null>(null);
  const [isPending, startTransition] = useTransition();

  const filtered = submissions.filter((s) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return (
        s.reference.toLowerCase().includes(q) ||
        s.ownerName.toLowerCase().includes(q) ||
        s.ownerPhone.toLowerCase().includes(q) ||
        s.locality.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleStatus = (status: "approved" | "rejected" | "under_review" | "verification_scheduled") => {
    if (!selectedSub) return;
    if (status === "approved") {
      if (!confirm("Approving this submission will immediately publish a live active listing on HTC. Proceed?")) return;
    }

    startTransition(async () => {
      const res = await adminUpdateSubmissionStatusAction({
        submissionId: selectedSub.id,
        status,
      });
      if (res.success) {
        router.refresh();
        if (res.submission) setSelectedSub((prev) => (prev ? { ...prev, ...res.submission } : null));
      } else {
        alert(res.error || "Failed to update submission");
      }
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-display-sm text-text-primary">Owner Property Submissions</h1>
        <p className="text-body-sm text-text-secondary mt-1">
          Review owner-submitted flats, schedule on-site verification, and publish live listings.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6 items-start">
        {/* Table */}
        <div className="rounded-2xl border border-border-subtle bg-surface-raised shadow-sm overflow-hidden">
          <table className="w-full text-left text-body-sm">
            <thead className="bg-surface-sunken border-b border-border-subtle text-body-xs uppercase text-text-secondary">
              <tr>
                <th className="px-4 py-3">Reference</th>
                <th className="px-4 py-3">Owner</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Rent</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {filtered.map((s) => (
                <tr
                  key={s.id}
                  onClick={() => setSelectedSub(s)}
                  className={`cursor-pointer ${selectedSub?.id === s.id ? "bg-red-50/60" : "hover:bg-surface-sunken"}`}
                >
                  <td className="px-4 py-3 font-mono font-bold text-text-primary">{s.reference}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-text-primary">{s.ownerName}</p>
                    <p className="text-body-xs text-text-tertiary">{s.ownerPhone}</p>
                  </td>
                  <td className="px-4 py-3">
                    {s.bhk ? `${s.bhk} BHK · ` : ""}{s.communityName || s.locality}
                  </td>
                  <td className="px-4 py-3 font-bold">₹{s.price.toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3">
                    <span className="px-2.5 py-0.5 rounded-full text-label font-semibold capitalize bg-blue-50 text-blue-800">
                      {s.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button className="text-body-xs font-semibold text-red-600 hover:underline">
                      Inspect →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Drawer */}
        {selectedSub ? (
          <div className="rounded-2xl border border-border-subtle bg-surface-raised p-6 shadow-md space-y-6">
            <div className="flex items-start justify-between border-b border-border-subtle pb-4">
              <div>
                <span className="font-mono text-body-xs font-bold text-text-tertiary">{selectedSub.reference}</span>
                <h3 className="text-title-sm font-bold text-text-primary mt-1">{selectedSub.ownerName}</h3>
                <p className="text-body-xs text-text-secondary">{selectedSub.ownerEmail}</p>
              </div>
              <button onClick={() => setSelectedSub(null)} className="text-text-tertiary hover:text-text-primary">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="rounded-xl bg-surface-sunken p-4 text-body-sm space-y-2">
              <p><strong>Property:</strong> {selectedSub.bhk} BHK in {selectedSub.communityName || selectedSub.locality}</p>
              <p><strong>Locality:</strong> {selectedSub.locality}, {selectedSub.city}</p>
              <p><strong>Expected Rent:</strong> ₹{selectedSub.price.toLocaleString("en-IN")}/month</p>
              <p><strong>Status:</strong> <span className="capitalize font-semibold">{selectedSub.status.replace("_", " ")}</span></p>
            </div>

            <div className="flex gap-2">
              <Button
                variant="primary"
                size="md"
                onClick={() => handleStatus("approved")}
                disabled={isPending || selectedSub.status === "approved"}
                className="flex-1 justify-center bg-green-700 hover:bg-green-800"
              >
                <Check className="mr-1.5 h-4 w-4" /> Approve & Publish
              </Button>
              <Button
                variant="secondary"
                size="md"
                onClick={() => handleStatus("rejected")}
                disabled={isPending || selectedSub.status === "rejected"}
                className="text-red-700"
              >
                <XCircle className="h-4 w-4" /> Reject
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
