"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogOut, ShieldCheck, User } from "lucide-react";
import { logoutAction } from "@/app/actions/auth";

export function AdminHeader({
  user,
}: {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}) {
  const router = useRouter();

  const handleLogout = async () => {
    await logoutAction();
    router.push("/login");
    router.refresh();
  };

  return (
    <header className="h-16 bg-surface-raised border-b border-border-subtle px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      <div className="flex items-center gap-4">
        <Link href="/admin" className="flex items-center gap-2">
          <span className="font-serif font-bold text-title-md text-red-600">HTC</span>
          <span className="text-body-xs font-semibold uppercase tracking-wider bg-red-100 text-red-800 px-2 py-0.5 rounded-full">
            Operations
          </span>
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5 text-body-sm">
          <div className="h-8 w-8 rounded-full bg-red-100 text-red-700 font-bold flex items-center justify-center font-serif text-title-sm">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="hidden sm:block text-left">
            <p className="font-medium text-text-primary leading-none">{user.name}</p>
            <p className="text-body-xs text-text-tertiary capitalize mt-0.5">{user.role}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="p-2 rounded-lg text-text-tertiary hover:text-red-600 hover:bg-surface-sunken transition-colors"
          title="Sign out of Operations"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
