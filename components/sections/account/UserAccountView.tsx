"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FileText,
  Bookmark,
  Building2,
  User as UserIcon,
  LogOut,
  Clock,
  CheckCircle2,
  XCircle,
  Calendar,
  Phone,
  ArrowRight,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/primitives/Button";
import { logoutAction } from "@/app/actions/auth";
import { withdrawApplicationAction, toggleSaveListingAction } from "@/app/actions/applications";
import { useRouter } from "next/navigation";

interface ApplicationItem {
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
  createdAt: Date;
  listingId: string;
  listingTitle: string;
  listingSlug: string;
  listingPrice: number;
  listingLocality: string;
  listingBhk: number | null;
}

interface StatusEventItem {
  id: string;
  entityType: string;
  entityId: string;
  fromStatus: string | null;
  toStatus: string;
  actorName: string;
  reason: string | null;
  createdAt: Date;
}

interface SavedListingItem {
  listingId: string;
  title: string;
  slug: string;
  price: number;
  locality: string;
  bhk: number | null;
  areaSqft: number | null;
  status: string;
  intent: string;
  savedAt: Date;
}

interface SubmissionItem {
  id: string;
  reference: string;
  locality: string;
  city: string;
  communityName: string | null;
  bhk: number | null;
  price: number;
  status: string;
  createdAt: Date;
}

interface UserAccountViewProps {
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
    role: string;
  };
  applications: ApplicationItem[];
  statusEvents: StatusEventItem[];
  savedListings: SavedListingItem[];
  submissions: SubmissionItem[];
}

export function UserAccountView({
  user,
  applications,
  statusEvents,
  savedListings,
  submissions,
}: UserAccountViewProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"applications" | "saved" | "submissions" | "profile">("applications");
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null);

  const handleLogout = async () => {
    await logoutAction();
    router.push("/");
    router.refresh();
  };

  const handleWithdraw = async (appId: string) => {
    if (!confirm("Are you sure you want to withdraw this application?")) return;
    setWithdrawingId(appId);
    await withdrawApplicationAction(appId);
    setWithdrawingId(null);
    router.refresh();
  };

  const handleRemoveSaved = async (listingId: string) => {
    await toggleSaveListingAction(listingId);
    router.refresh();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "submitted":
        return <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-label font-semibold text-blue-800">Submitted</span>;
      case "contacted":
        return <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-label font-semibold text-amber-800">Under Contact</span>;
      case "visit_scheduled":
        return <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-100 px-3 py-1 text-label font-semibold text-purple-800">Visit Scheduled</span>;
      case "approved":
        return <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-label font-semibold text-emerald-800">Approved</span>;
      case "closed_won":
        return <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-label font-semibold text-green-800">Closed (Won)</span>;
      case "closed_lost":
        return <span className="inline-flex items-center gap-1.5 rounded-full bg-stone-200 px-3 py-1 text-label font-semibold text-stone-700">Closed</span>;
      case "withdrawn":
        return <span className="inline-flex items-center gap-1.5 rounded-full bg-stone-200 px-3 py-1 text-label font-semibold text-stone-600">Withdrawn</span>;
      default:
        return <span className="inline-flex items-center gap-1.5 rounded-full bg-stone-100 px-3 py-1 text-label font-semibold text-stone-800">{status}</span>;
    }
  };

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[260px_1fr]">
      {/* Sidebar Navigation */}
      <aside className="rounded-2xl border border-border-subtle bg-surface-raised p-6 shadow-sm h-fit">
        <div className="border-b border-border-subtle pb-5 mb-5">
          <div className="h-12 w-12 rounded-full bg-red-100 text-red-700 flex items-center justify-center font-serif text-title-lg font-bold">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <h2 className="mt-3 text-title-sm font-semibold text-text-primary truncate">{user.name}</h2>
          <p className="text-body-xs text-text-secondary truncate">{user.email}</p>
          {user.role === "admin" || user.role === "staff" ? (
            <Link
              href="/admin"
              className="mt-3 inline-block rounded-full bg-red-600 px-3 py-1 text-label text-white hover:bg-red-700"
            >
              Open Staff Admin →
            </Link>
          ) : null}
        </div>

        <nav className="space-y-1">
          <button
            onClick={() => setActiveTab("applications")}
            className={`w-full flex items-center justify-between rounded-xl px-4 py-2.5 text-body-sm font-medium transition-colors ${
              activeTab === "applications"
                ? "bg-red-50 text-red-700 font-semibold"
                : "text-text-secondary hover:bg-surface-sunken hover:text-text-primary"
            }`}
          >
            <span className="flex items-center gap-3">
              <FileText className="h-4 w-4" /> My Applications
            </span>
            <span className="rounded-full bg-surface-sunken px-2 py-0.5 text-label">
              {applications.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("saved")}
            className={`w-full flex items-center justify-between rounded-xl px-4 py-2.5 text-body-sm font-medium transition-colors ${
              activeTab === "saved"
                ? "bg-red-50 text-red-700 font-semibold"
                : "text-text-secondary hover:bg-surface-sunken hover:text-text-primary"
            }`}
          >
            <span className="flex items-center gap-3">
              <Bookmark className="h-4 w-4" /> Saved Homes
            </span>
            <span className="rounded-full bg-surface-sunken px-2 py-0.5 text-label">
              {savedListings.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("submissions")}
            className={`w-full flex items-center justify-between rounded-xl px-4 py-2.5 text-body-sm font-medium transition-colors ${
              activeTab === "submissions"
                ? "bg-red-50 text-red-700 font-semibold"
                : "text-text-secondary hover:bg-surface-sunken hover:text-text-primary"
            }`}
          >
            <span className="flex items-center gap-3">
              <Building2 className="h-4 w-4" /> My Submissions
            </span>
            <span className="rounded-full bg-surface-sunken px-2 py-0.5 text-label">
              {submissions.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("profile")}
            className={`w-full flex items-center gap-3 rounded-xl px-4 py-2.5 text-body-sm font-medium transition-colors ${
              activeTab === "profile"
                ? "bg-red-50 text-red-700 font-semibold"
                : "text-text-secondary hover:bg-surface-sunken hover:text-text-primary"
            }`}
          >
            <UserIcon className="h-4 w-4" /> Profile Details
          </button>
        </nav>

        <div className="mt-8 border-t border-border-subtle pt-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 rounded-xl px-4 py-2.5 text-body-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="h-4 w-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="space-y-6">
        {activeTab === "applications" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-serif text-display-sm text-text-primary">My Applications</h1>
                <p className="text-body-sm text-text-secondary">
                  Track the status of your rent and purchase applications.
                </p>
              </div>
              <Link href="/properties">
                <Button variant="outline" size="sm">
                  Browse More Homes
                </Button>
              </Link>
            </div>

            {applications.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border-strong bg-surface-raised p-12 text-center">
                <FileText className="mx-auto h-10 w-10 text-text-tertiary" />
                <h3 className="mt-4 text-title-md font-semibold text-text-primary">No applications yet</h3>
                <p className="mt-2 text-body-sm text-text-secondary">
                  When you apply for a flat, your active status and schedule will show here.
                </p>
                <div className="mt-6">
                  <Link href="/properties">
                    <Button variant="primary" size="md">
                      Explore Properties
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {applications.map((app) => {
                  const appEvents = statusEvents.filter((e) => e.entityId === app.id);
                  const isOpen = !["closed_won", "closed_lost", "withdrawn"].includes(app.status);

                  return (
                    <div
                      key={app.id}
                      className="rounded-2xl border border-border-subtle bg-surface-raised p-6 shadow-sm"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-subtle pb-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-label font-mono font-bold text-text-tertiary">
                              {app.reference}
                            </span>
                            {getStatusBadge(app.status)}
                          </div>
                          <Link
                            href={`/properties/${app.listingSlug}`}
                            className="mt-1 block text-title-md font-serif font-bold text-text-primary hover:text-red-600 transition-colors"
                          >
                            {app.listingTitle}
                          </Link>
                        </div>
                        <div className="text-right sm:self-center">
                          <p className="font-sans text-price font-bold text-text-primary">
                            ₹{app.listingPrice.toLocaleString("en-IN")}/mo
                          </p>
                          <p className="text-body-xs text-text-tertiary">
                            Applied on {new Date(app.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {/* Application Details */}
                      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-body-sm">
                        <div>
                          <p className="text-text-tertiary text-body-xs">Intent</p>
                          <p className="font-medium text-text-primary capitalize">{app.intent}</p>
                        </div>
                        <div>
                          <p className="text-text-tertiary text-body-xs">Expected Move-in</p>
                          <p className="font-medium text-text-primary">{app.moveInDate || "Immediate"}</p>
                        </div>
                        <div>
                          <p className="text-text-tertiary text-body-xs">Occupants</p>
                          <p className="font-medium text-text-primary">{app.occupants || 1} Person(s)</p>
                        </div>
                        <div>
                          <p className="text-text-tertiary text-body-xs">Contact</p>
                          <p className="font-medium text-text-primary">{app.contactPhone}</p>
                        </div>
                      </div>

                      {app.visitAt && (
                        <div className="mt-4 rounded-xl bg-purple-50 p-3.5 border border-purple-200 flex items-center gap-3 text-body-sm text-purple-900">
                          <Calendar className="h-5 w-5 text-purple-700 shrink-0" />
                          <span>
                            <strong>Visit Scheduled:</strong> {new Date(app.visitAt).toLocaleString()} with HTC site team.
                          </span>
                        </div>
                      )}

                      {app.closeReason && (
                        <div className="mt-4 rounded-xl bg-stone-100 p-3.5 text-body-sm text-stone-700">
                          <strong>Note:</strong> {app.closeReason}
                        </div>
                      )}

                      {/* Status History Timeline */}
                      {appEvents.length > 0 && (
                        <div className="mt-5 border-t border-border-subtle pt-4">
                          <p className="text-body-xs font-semibold text-text-tertiary uppercase tracking-wider mb-2">
                            Activity Timeline
                          </p>
                          <div className="space-y-2">
                            {appEvents.map((evt) => (
                              <div key={evt.id} className="flex items-start gap-2 text-body-xs text-text-secondary">
                                <Clock className="h-3.5 w-3.5 text-text-tertiary mt-0.5" />
                                <span>
                                  <strong>{evt.toStatus.replace("_", " ").toUpperCase()}</strong>: {evt.reason || "Status updated"} ·{" "}
                                  <span className="text-text-tertiary">{new Date(evt.createdAt).toLocaleString()}</span>
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {isOpen && (
                        <div className="mt-5 flex justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleWithdraw(app.id)}
                            disabled={withdrawingId === app.id}
                            className="text-stone-500 hover:text-red-600 hover:bg-red-50"
                          >
                            {withdrawingId === app.id ? "Withdrawing..." : "Withdraw Application"}
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === "saved" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-serif text-display-sm text-text-primary">Saved Homes</h1>
                <p className="text-body-sm text-text-secondary">
                  Homes you have bookmarked for easy reference.
                </p>
              </div>
            </div>

            {savedListings.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border-strong bg-surface-raised p-12 text-center">
                <Bookmark className="mx-auto h-10 w-10 text-text-tertiary" />
                <h3 className="mt-4 text-title-md font-semibold text-text-primary">No saved homes</h3>
                <p className="mt-2 text-body-sm text-text-secondary">
                  Tap the bookmark icon on any flat to save it here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {savedListings.map((home) => (
                  <div
                    key={home.listingId}
                    className="rounded-2xl border border-border-subtle bg-surface-raised p-5 shadow-sm flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between">
                        <span className="text-label font-bold text-red-600 uppercase">{home.intent}</span>
                        <button
                          onClick={() => handleRemoveSaved(home.listingId)}
                          aria-label="Remove saved home"
                          className="text-text-tertiary hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <Link
                        href={`/properties/${home.slug}`}
                        className="mt-2 block text-title-sm font-semibold text-text-primary hover:text-red-600 line-clamp-2"
                      >
                        {home.title}
                      </Link>
                      <p className="mt-1 text-body-sm text-text-secondary">
                        {home.bhk ? `${home.bhk} BHK · ` : ""}{home.locality}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-border-subtle flex items-center justify-between">
                      <p className="font-bold text-text-primary font-sans">
                        ₹{home.price.toLocaleString("en-IN")}/mo
                      </p>
                      <Link href={`/properties/${home.slug}`}>
                        <Button variant="outline" size="sm">
                          View Home <ArrowRight className="ml-1 h-3.5 w-3.5" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "submissions" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-serif text-display-sm text-text-primary">My Property Submissions</h1>
                <p className="text-body-sm text-text-secondary">
                  Homes you have submitted to HTC for verification and listing.
                </p>
              </div>
              <Link href="/list-your-property">
                <Button variant="primary" size="sm">
                  + List New Property
                </Button>
              </Link>
            </div>

            {submissions.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border-strong bg-surface-raised p-12 text-center">
                <Building2 className="mx-auto h-10 w-10 text-text-tertiary" />
                <h3 className="mt-4 text-title-md font-semibold text-text-primary">No properties submitted yet</h3>
                <p className="mt-2 text-body-sm text-text-secondary">
                  List your property with HTC — verified by our facility managers with zero brokerage.
                </p>
                <div className="mt-6">
                  <Link href="/list-your-property">
                    <Button variant="primary" size="md">
                      List Your Property
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {submissions.map((sub) => (
                  <div
                    key={sub.id}
                    className="rounded-2xl border border-border-subtle bg-surface-raised p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-body-xs font-bold text-text-tertiary">{sub.reference}</span>
                        <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-label font-semibold text-blue-700 capitalize">
                          {sub.status.replace("_", " ")}
                        </span>
                      </div>
                      <h4 className="mt-1 text-title-sm font-semibold text-text-primary">
                        {sub.bhk ? `${sub.bhk} BHK in ` : ""}{sub.communityName || sub.locality}, {sub.locality}
                      </h4>
                      <p className="text-body-xs text-text-secondary">
                        Submitted on {new Date(sub.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="font-sans font-bold text-text-primary">
                        ₹{sub.price.toLocaleString("en-IN")}/mo
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "profile" && (
          <div className="rounded-2xl border border-border-subtle bg-surface-raised p-8 shadow-sm">
            <h1 className="font-serif text-display-sm text-text-primary mb-6">Profile Details</h1>
            <div className="space-y-4 max-w-lg">
              <div>
                <label className="block text-body-xs font-medium text-text-tertiary">Full Name</label>
                <p className="text-body-md font-semibold text-text-primary mt-1">{user.name}</p>
              </div>
              <div>
                <label className="block text-body-xs font-medium text-text-tertiary">Email Address</label>
                <p className="text-body-md font-semibold text-text-primary mt-1">{user.email}</p>
              </div>
              <div>
                <label className="block text-body-xs font-medium text-text-tertiary">Phone Number</label>
                <p className="text-body-md font-semibold text-text-primary mt-1">{user.phone || "Not provided"}</p>
              </div>
              <div>
                <label className="block text-body-xs font-medium text-text-tertiary">Account Role</label>
                <p className="text-body-md font-semibold text-text-primary mt-1 capitalize">{user.role}</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
