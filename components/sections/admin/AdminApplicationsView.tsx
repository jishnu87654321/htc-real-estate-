"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Search,
  Download,
  Phone,
  MessageCircle,
  Clock,
  CheckCircle,
  XCircle,
  Calendar,
  X,
  Plus,
  Lock,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/primitives/Button";
import {
  adminUpdateApplicationStatusAction,
  adminAddNoteAction,
  adminAssignEntityAction,
} from "@/app/actions/admin";

interface ApplicationRecord {
  id: string;
  reference: string;
  intent: "rent" | "buy";
  status: string;
  moveInDate: string | null;
  budget: number | null;
  occupants: number | null;
  contactPhone: string;
  message: string | null;
  closeReason: string | null;
  nextFollowUpAt: Date | null;
  visitAt: Date | null;
  assignedTo: string | null;
  createdAt: Date;
  listingId: string;
  listingTitle: string;
  listingSlug: string;
  listingPrice: number;
  listingLocality: string;
  userName: string;
  userEmail: string;
}

interface NoteRecord {
  id: string;
  entityType: string;
  entityId: string;
  authorName: string;
  noteText: string;
  isPrivate: boolean;
  createdAt: Date;
}

interface StatusEventRecord {
  id: string;
  entityType: string;
  entityId: string;
  fromStatus: string | null;
  toStatus: string;
  actorName: string;
  reason: string | null;
  createdAt: Date;
}

interface StaffUser {
  id: string;
  name: string;
  role: string;
}

export function AdminApplicationsView({
  applications,
  staffUsers,
  notes,
  statusEvents,
}: {
  applications: ApplicationRecord[];
  staffUsers: StaffUser[];
  notes: NoteRecord[];
  statusEvents: StatusEventRecord[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRef = searchParams.get("ref");

  const [searchQuery, setSearchQuery] = useState(initialRef || "");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedApp, setSelectedApp] = useState<ApplicationRecord | null>(
    initialRef ? applications.find((a) => a.reference === initialRef) || null : null
  );

  // Status update form states
  const [newStatus, setNewStatus] = useState<string>("");
  const [statusReason, setStatusReason] = useState("");
  const [visitDate, setVisitDate] = useState("");
  const [newNoteText, setNewNoteText] = useState("");
  const [isPrivateNote, setIsPrivateNote] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Filtered records
  const filteredApps = applications.filter((app) => {
    if (statusFilter !== "all" && app.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return (
        app.reference.toLowerCase().includes(q) ||
        app.userName.toLowerCase().includes(q) ||
        app.userEmail.toLowerCase().includes(q) ||
        app.contactPhone.toLowerCase().includes(q) ||
        app.listingTitle.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleSelectApp = (app: ApplicationRecord) => {
    setSelectedApp(app);
    setNewStatus(app.status);
    setStatusReason("");
    setVisitDate(app.visitAt ? new Date(app.visitAt).toISOString().slice(0, 16) : "");
  };

  const handleStatusChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp || !newStatus) return;

    startTransition(async () => {
      const res = await adminUpdateApplicationStatusAction({
        applicationId: selectedApp.id,
        status: newStatus as any,
        reason: statusReason || undefined,
        visitAt: visitDate ? new Date(visitDate).toISOString() : null,
      });

      if (res.success) {
        router.refresh();
        if (res.application) {
          setSelectedApp((prev) => (prev ? { ...prev, ...res.application } : null));
        }
      } else {
        alert(res.error || "Failed to update status");
      }
    });
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp || !newNoteText.trim()) return;

    startTransition(async () => {
      const res = await adminAddNoteAction({
        entityType: "application",
        entityId: selectedApp.id,
        noteText: newNoteText,
        isPrivate: isPrivateNote,
      });

      if (res.success) {
        setNewNoteText("");
        router.refresh();
      } else {
        alert(res.error || "Failed to add note");
      }
    });
  };

  const handleAssignChange = (userId: string) => {
    if (!selectedApp) return;
    startTransition(async () => {
      await adminAssignEntityAction({
        entityType: "application",
        entityId: selectedApp.id,
        assignedTo: userId || null,
      });
      router.refresh();
    });
  };

  const exportCSV = () => {
    const headers = [
      "Reference",
      "Listing",
      "Applicant Name",
      "Email",
      "Phone",
      "Intent",
      "Status",
      "Price",
      "Move In Date",
      "Occupants",
      "Applied At",
    ];

    const rows = filteredApps.map((a) => [
      a.reference,
      `"${a.listingTitle.replace(/"/g, '""')}"`,
      `"${a.userName}"`,
      a.userEmail,
      a.contactPhone,
      a.intent,
      a.status,
      a.listingPrice,
      a.moveInDate || "N/A",
      a.occupants || 1,
      new Date(a.createdAt).toISOString(),
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `htc-applications-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const selectedAppNotes = selectedApp ? notes.filter((n) => n.entityId === selectedApp.id) : [];
  const selectedAppEvents = selectedApp ? statusEvents.filter((e) => e.entityId === selectedApp.id) : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-display-sm text-text-primary">Rental & Purchase Applications</h1>
          <p className="text-body-sm text-text-secondary mt-1">
            Manage applicant vetting, society visits, negotiations, and approvals.
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={exportCSV} className="flex items-center gap-2">
          <Download className="h-4 w-4" /> Export CSV
        </Button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-text-tertiary" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search reference, applicant, phone..."
            className="w-full rounded-lg border border-border-strong bg-surface-raised pl-9 pr-4 py-2 text-body-sm text-text-primary focus:outline-none focus:border-red-600"
          />
        </div>

        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          {["all", "submitted", "contacted", "visit_scheduled", "approved", "closed_won", "closed_lost"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-full text-label uppercase tracking-wider font-semibold whitespace-nowrap transition-colors ${
                statusFilter === st
                  ? "bg-ink-900 text-white"
                  : "bg-surface-raised border border-border-subtle text-text-secondary hover:text-text-primary"
              }`}
            >
              {st.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Table & Detail Drawer Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-6 items-start">
        {/* Applications List Table */}
        <div className="rounded-2xl border border-border-subtle bg-surface-raised shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-body-sm">
              <thead className="bg-surface-sunken border-b border-border-subtle text-body-xs font-semibold text-text-secondary uppercase">
                <tr>
                  <th className="px-4 py-3">Reference</th>
                  <th className="px-4 py-3">Property</th>
                  <th className="px-4 py-3">Applicant</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {filteredApps.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-text-tertiary">
                      No applications match the current filters.
                    </td>
                  </tr>
                ) : (
                  filteredApps.map((app) => {
                    const isSelected = selectedApp?.id === app.id;
                    return (
                      <tr
                        key={app.id}
                        onClick={() => handleSelectApp(app)}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? "bg-red-50/60" : "hover:bg-surface-sunken"
                        }`}
                      >
                        <td className="px-4 py-3 font-mono font-bold text-text-primary">
                          {app.reference}
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-text-primary line-clamp-1">{app.listingTitle}</p>
                          <p className="text-body-xs text-text-tertiary">₹{app.listingPrice.toLocaleString("en-IN")}/mo</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-text-primary">{app.userName}</p>
                          <p className="text-body-xs text-text-tertiary">{app.contactPhone}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-label font-semibold capitalize ${
                              app.status === "closed_won"
                                ? "bg-green-100 text-green-800"
                                : app.status === "submitted"
                                ? "bg-blue-100 text-blue-800"
                                : app.status === "visit_scheduled"
                                ? "bg-purple-100 text-purple-800"
                                : "bg-stone-100 text-stone-800"
                            }`}
                          >
                            {app.status.replace("_", " ")}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-body-xs text-text-tertiary whitespace-nowrap">
                          {new Date(app.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectApp(app);
                            }}
                            className="text-body-xs font-semibold text-red-600 hover:underline"
                          >
                            Manage →
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Application Detail Drawer */}
        {selectedApp ? (
          <div className="rounded-2xl border border-border-subtle bg-surface-raised p-6 shadow-md space-y-6 sticky top-20">
            <div className="flex items-start justify-between border-b border-border-subtle pb-4">
              <div>
                <span className="font-mono text-body-xs font-bold text-text-tertiary">
                  {selectedApp.reference}
                </span>
                <h3 className="text-title-sm font-serif font-bold text-text-primary mt-1">
                  {selectedApp.userName}
                </h3>
                <p className="text-body-xs text-text-secondary">{selectedApp.userEmail}</p>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                aria-label="Close drawer"
                className="text-text-tertiary hover:text-text-primary p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Quick Contact Actions (WhatsApp & Call) */}
            <div className="flex gap-2">
              <a
                href={`tel:${selectedApp.contactPhone}`}
                className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-border-strong px-3 py-2 text-body-xs font-semibold text-text-primary hover:bg-surface-sunken transition-colors"
              >
                <Phone className="h-3.5 w-3.5 text-blue-600" /> Call
              </a>
              <a
                href={`https://wa.me/${selectedApp.contactPhone.replace(/\D/g, "")}?text=Hi%20${encodeURIComponent(
                  selectedApp.userName
                )},%20this%20is%20HTC%20regarding%20your%20application%20${selectedApp.reference}%20for%20${encodeURIComponent(
                  selectedApp.listingTitle
                )}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-green-300 bg-green-50 px-3 py-2 text-body-xs font-semibold text-green-800 hover:bg-green-100 transition-colors"
              >
                <MessageCircle className="h-3.5 w-3.5 text-green-600" /> WhatsApp
              </a>
            </div>

            {/* Property Link */}
            <div className="rounded-xl bg-surface-sunken p-3.5 text-body-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-text-primary">Property Applied</span>
                <Link
                  href={`/properties/${selectedApp.listingSlug}`}
                  target="_blank"
                  className="text-red-600 hover:underline flex items-center gap-1"
                >
                  View Listing <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
              <p className="mt-1 text-text-secondary">{selectedApp.listingTitle}</p>
              <p className="mt-1 font-bold text-text-primary font-sans">
                ₹{selectedApp.listingPrice.toLocaleString("en-IN")}/mo
              </p>
            </div>

            {/* Staff Assignment */}
            <div>
              <label className="block text-body-xs font-semibold text-text-tertiary uppercase tracking-wider mb-1.5">
                Assigned Staff Member
              </label>
              <select
                value={selectedApp.assignedTo || ""}
                onChange={(e) => handleAssignChange(e.target.value)}
                className="w-full rounded-lg border border-border-strong bg-surface-base px-3 py-2 text-body-sm text-text-primary focus:outline-none focus:border-red-600"
              >
                <option value="">Unassigned</option>
                {staffUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role})
                  </option>
                ))}
              </select>
            </div>

            {/* Status Transition Control */}
            <form onSubmit={handleStatusChange} className="space-y-3 border-t border-border-subtle pt-4">
              <label className="block text-body-xs font-semibold text-text-tertiary uppercase tracking-wider">
                Transition Status
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full rounded-lg border border-border-strong bg-surface-base px-3 py-2 text-body-sm text-text-primary focus:outline-none focus:border-red-600"
              >
                <option value="submitted">Submitted</option>
                <option value="contacted">Contacted / Vetting</option>
                <option value="visit_scheduled">Visit Scheduled</option>
                <option value="visit_done">Visit Completed</option>
                <option value="negotiating">Negotiating Terms</option>
                <option value="approved">Approved by Owner/RWA</option>
                <option value="closed_won">Closed Won (Auto-rents listing)</option>
                <option value="closed_lost">Closed Lost</option>
                <option value="withdrawn">Withdrawn</option>
              </select>

              {newStatus === "visit_scheduled" && (
                <div>
                  <label className="block text-body-xs text-text-tertiary mb-1">Visit Date & Time</label>
                  <input
                    type="datetime-local"
                    value={visitDate}
                    onChange={(e) => setVisitDate(e.target.value)}
                    className="w-full rounded-lg border border-border-strong bg-surface-base px-3 py-1.5 text-body-xs"
                  />
                </div>
              )}

              <div>
                <input
                  type="text"
                  value={statusReason}
                  onChange={(e) => setStatusReason(e.target.value)}
                  placeholder="Reason / Transition notes..."
                  className="w-full rounded-lg border border-border-strong bg-surface-base px-3 py-1.5 text-body-xs text-text-primary placeholder:text-text-tertiary"
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="sm"
                className="w-full justify-center"
                disabled={isPending || newStatus === selectedApp.status}
              >
                {isPending ? "Updating..." : "Apply Status Change"}
              </Button>
            </form>

            {/* Internal Staff Notes */}
            <div className="border-t border-border-subtle pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-body-xs font-semibold text-text-tertiary uppercase tracking-wider">
                  Internal Notes
                </span>
              </div>

              <div className="space-y-2 max-h-36 overflow-y-auto">
                {selectedAppNotes.length === 0 ? (
                  <p className="text-body-xs text-text-tertiary">No staff notes yet.</p>
                ) : (
                  selectedAppNotes.map((n) => (
                    <div key={n.id} className="rounded-lg bg-surface-sunken p-2.5 text-body-xs space-y-1">
                      <div className="flex items-center justify-between text-text-tertiary">
                        <span className="font-semibold text-text-primary">{n.authorName}</span>
                        <span>{new Date(n.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                      </div>
                      <p className="text-text-secondary">{n.noteText}</p>
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={handleAddNote} className="flex gap-2">
                <input
                  type="text"
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  placeholder="Add note..."
                  className="flex-1 rounded-lg border border-border-strong bg-surface-base px-3 py-1.5 text-body-xs text-text-primary"
                />
                <Button type="submit" variant="secondary" size="sm" disabled={isPending || !newNoteText.trim()}>
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </form>
            </div>

            {/* Timeline Events */}
            <div className="border-t border-border-subtle pt-4">
              <p className="text-body-xs font-semibold text-text-tertiary uppercase tracking-wider mb-2">
                Audit Timeline
              </p>
              <div className="space-y-1.5 max-h-32 overflow-y-auto text-body-xs text-text-secondary">
                {selectedAppEvents.map((evt) => (
                  <div key={evt.id} className="flex items-start gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-text-tertiary mt-0.5 shrink-0" />
                    <span>
                      <strong className="text-text-primary capitalize">{evt.toStatus.replace("_", " ")}</strong>:{" "}
                      {evt.reason || "Transitioned"} by {evt.actorName}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="hidden lg:block rounded-2xl border border-dashed border-border-strong p-8 text-center text-text-tertiary">
            Select an application to view details, call applicant, or transition status.
          </div>
        )}
      </div>
    </div>
  );
}
