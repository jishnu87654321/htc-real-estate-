"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search, Shield, UserCheck } from "lucide-react";
import { adminUpdateUserRoleAction } from "@/app/actions/admin";

interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: string;
  phone: string | null;
  disabled: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
}

export function AdminUsersView({ users }: { users: UserRecord[] }) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isPending, startTransition] = useTransition();

  const filtered = users.filter((u) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || (u.phone && u.phone.includes(q));
    }
    return true;
  });

  const handleRoleChange = (userId: string, newRole: "user" | "staff" | "admin") => {
    if (!confirm(`Are you sure you want to change this user's role to ${newRole}?`)) return;
    startTransition(async () => {
      const res = await adminUpdateUserRoleAction(userId, newRole);
      if (res.success) {
        router.refresh();
      } else {
        alert(res.error || "Failed to update role");
      }
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-display-sm text-text-primary">Users & Access Control</h1>
        <p className="text-body-sm text-text-secondary mt-1">
          Manage user accounts, staff permissions, and administrator privileges.
        </p>
      </div>

      <div className="rounded-2xl border border-border-subtle bg-surface-raised shadow-sm overflow-hidden">
        <table className="w-full text-left text-body-sm">
          <thead className="bg-surface-sunken border-b border-border-subtle text-body-xs uppercase text-text-secondary">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Last Login</th>
              <th className="px-4 py-3 text-right">Change Role</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {filtered.map((u) => (
              <tr key={u.id} className="hover:bg-surface-sunken">
                <td className="px-4 py-3 font-semibold text-text-primary">{u.name}</td>
                <td className="px-4 py-3 text-text-secondary">{u.email}</td>
                <td className="px-4 py-3">{u.phone || "—"}</td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-label font-semibold uppercase ${
                      u.role === "admin"
                        ? "bg-red-100 text-red-800"
                        : u.role === "staff"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-stone-100 text-stone-800"
                    }`}
                  >
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-body-xs text-text-tertiary">
                  {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString() : "Never"}
                </td>
                <td className="px-4 py-3 text-right">
                  <select
                    value={u.role}
                    onChange={(e) => handleRoleChange(u.id, e.target.value as any)}
                    disabled={isPending}
                    className="rounded-lg border border-border-strong bg-surface-base px-2.5 py-1 text-body-xs"
                  >
                    <option value="user">User</option>
                    <option value="staff">Staff</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
