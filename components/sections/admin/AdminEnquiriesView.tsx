"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search, Phone, MessageCircle, X, Plus } from "lucide-react";
import { Button } from "@/components/primitives/Button";
import {
  adminUpdateEnquiryStatusAction,
  adminAddNoteAction,
  adminAssignEntityAction,
} from "@/app/actions/admin";

interface EnquiryRecord {
  id: string;
  reference: string;
  name: string;
  email: string;
  phone: string;
  category: string;
  message: string;
  source: string;
  status: string;
  assignedTo: string | null;
  createdAt: Date;
}

interface NoteRecord {
  id: string;
  entityId: string;
  authorName: string;
  noteText: string;
  createdAt: Date;
}

interface StaffUser {
  id: string;
  name: string;
  role: string;
}

export function AdminEnquiriesView({
  enquiries,
  staffUsers,
  notes,
}: {
  enquiries: EnquiryRecord[];
  staffUsers: StaffUser[];
  notes: NoteRecord[];
}) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedEnquiry, setSelectedEnquiry] = useState<EnquiryRecord | null>(null);

  const [newStatus, setNewStatus] = useState<string>("");
  const [newNote, setNewNote] = useState("");
  const [isPending, startTransition] = useTransition();

  const filtered = enquiries.filter((e) => {
    if (statusFilter !== "all" && e.status !== statusFilter) return false;
    if (categoryFilter !== "all" && e.category !== categoryFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return (
        e.reference.toLowerCase().includes(q) ||
        e.name.toLowerCase().includes(q) ||
        e.email.toLowerCase().includes(q) ||
        e.phone.toLowerCase().includes(q) ||
        e.message.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleSelect = (e: EnquiryRecord) => {
    setSelectedEnquiry(e);
    setNewStatus(e.status);
  };

  const handleStatusChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEnquiry || !newStatus) return;

    startTransition(async () => {
      const res = await adminUpdateEnquiryStatusAction({
        enquiryId: selectedEnquiry.id,
        status: newStatus as any,
      });
      if (res.success) {
        router.refresh();
        if (res.enquiry) setSelectedEnquiry((prev) => (prev ? { ...prev, ...res.enquiry } : null));
      } else {
        alert(res.error || "Failed to update status");
      }
    });
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEnquiry || !newNote.trim()) return;

    startTransition(async () => {
      const res = await adminAddNoteAction({
        entityType: "enquiry",
        entityId: selectedEnquiry.id,
        noteText: newNote,
        isPrivate: false,
      });
      if (res.success) {
        setNewNote("");
        router.refresh();
      } else {
        alert(res.error || "Failed to add note");
      }
    });
  };

  const handleAssign = (userId: string) => {
    if (!selectedEnquiry) return;
    startTransition(async () => {
      await adminAssignEntityAction({
        entityType: "enquiry",
        entityId: selectedEnquiry.id,
        assignedTo: userId || null,
      });
      router.refresh();
    });
  };

  const selectedNotes = selectedEnquiry ? notes.filter((n) => n.entityId === selectedEnquiry.id) : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-display-sm text-text-primary">Inquiries & Leads</h1>
        <p className="text-body-sm text-text-secondary mt-1">
          Respond to general inquiries, buyer/tenant questions, and support requests.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-text-tertiary" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search leads..."
            className="w-full rounded-lg border border-border-strong bg-surface-raised pl-9 pr-4 py-2 text-body-sm"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
          {["all", "new", "in_progress", "contacted", "resolved", "spam"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-full text-label uppercase font-semibold whitespace-nowrap ${
                statusFilter === s
                  ? "bg-ink-900 text-white"
                  : "bg-surface-raised border border-border-subtle text-text-secondary"
              }`}
            >
              {s.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6 items-start">
        {/* Table */}
        <div className="rounded-2xl border border-border-subtle bg-surface-raised shadow-sm overflow-hidden">
          <table className="w-full text-left text-body-sm">
            <thead className="bg-surface-sunken border-b border-border-subtle text-body-xs uppercase text-text-secondary">
              <tr>
                <th className="px-4 py-3">Reference</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Source</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-text-tertiary">
                    No inquiries match the filter.
                  </td>
                </tr>
              ) : (
                filtered.map((enq) => (
                  <tr
                    key={enq.id}
                    onClick={() => handleSelect(enq)}
                    className={`cursor-pointer ${
                      selectedEnquiry?.id === enq.id ? "bg-red-50/60" : "hover:bg-surface-sunken"
                    }`}
                  >
                    <td className="px-4 py-3 font-mono font-bold text-text-primary">{enq.reference}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-text-primary">{enq.name}</p>
                      <p className="text-body-xs text-text-tertiary">{enq.phone}</p>
                    </td>
                    <td className="px-4 py-3 capitalize text-body-xs">{enq.category.replace("_", " ")}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full text-label uppercase font-semibold bg-stone-100">
                        {enq.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-body-xs text-text-tertiary">{enq.source}</td>
                    <td className="px-4 py-3 text-right">
                      <button className="text-body-xs font-semibold text-red-600 hover:underline">
                        Review →
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Drawer */}
        {selectedEnquiry ? (
          <div className="rounded-2xl border border-border-subtle bg-surface-raised p-6 shadow-md space-y-6">
            <div className="flex items-start justify-between border-b border-border-subtle pb-4">
              <div>
                <span className="font-mono text-body-xs font-bold text-text-tertiary">{selectedEnquiry.reference}</span>
                <h3 className="text-title-sm font-bold text-text-primary mt-1">{selectedEnquiry.name}</h3>
                <p className="text-body-xs text-text-secondary">{selectedEnquiry.email}</p>
              </div>
              <button onClick={() => setSelectedEnquiry(null)} className="text-text-tertiary hover:text-text-primary">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex gap-2">
              <a
                href={`tel:${selectedEnquiry.phone}`}
                className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-border-strong px-3 py-2 text-body-xs font-semibold"
              >
                <Phone className="h-3.5 w-3.5 text-blue-600" /> Call
              </a>
              <a
                href={`https://wa.me/${selectedEnquiry.phone.replace(/\D/g, "")}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-green-300 bg-green-50 px-3 py-2 text-body-xs font-semibold text-green-800"
              >
                <MessageCircle className="h-3.5 w-3.5 text-green-600" /> WhatsApp
              </a>
            </div>

            <div className="rounded-xl bg-surface-sunken p-4 text-body-sm">
              <span className="text-label font-bold uppercase text-text-tertiary">Message</span>
              <p className="mt-1 text-text-primary leading-relaxed whitespace-pre-wrap">{selectedEnquiry.message}</p>
            </div>

            {/* Status Change */}
            <form onSubmit={handleStatusChange} className="space-y-3 border-t border-border-subtle pt-4">
              <label className="block text-body-xs font-semibold text-text-tertiary uppercase">Update Status</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full rounded-lg border border-border-strong bg-surface-base px-3 py-2 text-body-sm"
              >
                <option value="new">New</option>
                <option value="in_progress">In Progress</option>
                <option value="contacted">Contacted</option>
                <option value="resolved">Resolved</option>
                <option value="spam">Spam</option>
              </select>

              <Button
                type="submit"
                variant="primary"
                size="sm"
                className="w-full justify-center"
                disabled={isPending || newStatus === selectedEnquiry.status}
              >
                {isPending ? "Updating..." : "Update Status"}
              </Button>
            </form>

            {/* Notes */}
            <div className="border-t border-border-subtle pt-4 space-y-3">
              <span className="text-body-xs font-semibold text-text-tertiary uppercase">Staff Notes</span>
              <div className="space-y-2 max-h-36 overflow-y-auto">
                {selectedNotes.map((n) => (
                  <div key={n.id} className="rounded-lg bg-surface-sunken p-2.5 text-body-xs">
                    <p className="font-semibold text-text-primary">{n.authorName}</p>
                    <p className="text-text-secondary mt-0.5">{n.noteText}</p>
                  </div>
                ))}
              </div>

              <form onSubmit={handleAddNote} className="flex gap-2">
                <input
                  type="text"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Add note..."
                  className="flex-1 rounded-lg border border-border-strong bg-surface-base px-3 py-1.5 text-body-xs"
                />
                <Button type="submit" variant="secondary" size="sm" disabled={isPending || !newNote.trim()}>
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </form>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
