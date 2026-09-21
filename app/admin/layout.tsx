import { requireRole } from "@/lib/auth/session";
import Link from "next/link";
import {
  LayoutDashboard,
  FileText,
  MessageSquare,
  Building2,
  Calendar,
  Home,
  Users,
  ShieldAlert,
  LogOut,
  ExternalLink,
} from "lucide-react";
import { AdminHeader } from "@/components/sections/admin/AdminHeader";

export const metadata = {
  title: "HTC Operations & Admin Portal",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireRole(["staff", "admin"], "/admin");

  return (
    <div className="min-h-screen bg-surface-sunken flex flex-col">
      <AdminHeader user={session.user} />
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Admin Navigation Sidebar */}
        <aside className="w-full md:w-64 bg-surface-raised border-r border-border-subtle p-4 shrink-0">
          <nav className="space-y-1">
            <Link
              href="/admin"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-body-sm font-medium text-text-primary hover:bg-surface-sunken hover:text-red-600 transition-colors"
            >
              <LayoutDashboard className="h-4 w-4 text-text-tertiary" /> Dashboard
            </Link>

            <Link
              href="/admin/applications"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-body-sm font-medium text-text-primary hover:bg-surface-sunken hover:text-red-600 transition-colors"
            >
              <FileText className="h-4 w-4 text-text-tertiary" /> Applications
            </Link>

            <Link
              href="/admin/enquiries"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-body-sm font-medium text-text-primary hover:bg-surface-sunken hover:text-red-600 transition-colors"
            >
              <MessageSquare className="h-4 w-4 text-text-tertiary" /> Queries & Leads
            </Link>

            <Link
              href="/admin/submissions"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-body-sm font-medium text-text-primary hover:bg-surface-sunken hover:text-red-600 transition-colors"
            >
              <Building2 className="h-4 w-4 text-text-tertiary" /> Submissions
            </Link>

            <Link
              href="/admin/walkthroughs"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-body-sm font-medium text-text-primary hover:bg-surface-sunken hover:text-red-600 transition-colors"
            >
              <Calendar className="h-4 w-4 text-text-tertiary" /> Walkthroughs
            </Link>

            <Link
              href="/admin/listings"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-body-sm font-medium text-text-primary hover:bg-surface-sunken hover:text-red-600 transition-colors"
            >
              <Home className="h-4 w-4 text-text-tertiary" /> Property Listings
            </Link>

            <Link
              href="/admin/users"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-body-sm font-medium text-text-primary hover:bg-surface-sunken hover:text-red-600 transition-colors"
            >
              <Users className="h-4 w-4 text-text-tertiary" /> Users & Roles
            </Link>

            <Link
              href="/admin/activity"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-body-sm font-medium text-text-primary hover:bg-surface-sunken hover:text-red-600 transition-colors"
            >
              <ShieldAlert className="h-4 w-4 text-text-tertiary" /> Audit & Security
            </Link>
          </nav>

          <div className="mt-8 border-t border-border-subtle pt-4 space-y-2">
            <Link
              href="/"
              target="_blank"
              className="flex items-center justify-between px-3 py-2 rounded-lg text-body-xs font-medium text-text-tertiary hover:bg-surface-sunken hover:text-text-primary"
            >
              <span>View Public Website</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </div>
        </aside>

        {/* Admin Content Area */}
        <main className="flex-1 p-6 lg:p-8 overflow-x-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
