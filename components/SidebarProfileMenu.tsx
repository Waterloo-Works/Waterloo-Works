"use client";

import Link from "next/link";
import { useState } from "react";
import { signOut } from "@/app/actions/auth";

interface SidebarProfileMenuProps {
  user: {
    email?: string;
    user_metadata?: {
      full_name?: string;
    };
  } | null;
  isAdmin: boolean;
}

export function SidebarProfileMenu({ user, isAdmin }: SidebarProfileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const initials = (() => {
    if (user?.user_metadata?.full_name) {
      const parts = String(user.user_metadata.full_name).trim().split(/\s+/);
      if (parts.length >= 2) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
      return parts[0][0].toUpperCase();
    }
    return (user?.email?.[0] || "U").toUpperCase();
  })();

  const handleSignOut = async () => {
    await signOut();
  };

  if (!user) {
    return (
      <div className="mt-auto p-3">
        <Link
          href="/login"
          className="flex items-center justify-center rounded-full border border-zinc-300 px-4 py-2 text-sm text-zinc-900 hover:bg-zinc-50 transition-colors"
        >
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-auto p-3 relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-sm transition-colors hover:bg-zinc-100"
        aria-label="User menu"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-white text-xs font-medium">
          {initials}
        </div>
        <div className="flex-1 text-left overflow-hidden">
          <p className="truncate text-sm font-medium text-zinc-900">
            {user.user_metadata?.full_name || user.email}
          </p>
          <p className="truncate text-xs text-zinc-600">{user.email}</p>
        </div>
      </button>

      {isOpen && (
        <>
          {/* Backdrop to close menu when clicking outside */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu that opens UPWARD */}
          <div className="absolute bottom-full left-3 right-3 mb-2 z-50 rounded-2xl border border-zinc-200 bg-white shadow-lg">
            <div className="py-2">
              <Link
                href="/profile"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-900 transition-colors hover:bg-zinc-50"
              >
                <span>Profile</span>
              </Link>
              <Link
                href="/my-jobs"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-900 transition-colors hover:bg-zinc-50"
              >
                <span>My Job Submissions</span>
              </Link>
              {isAdmin && (
                <Link
                  href="/admin"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-900 transition-colors hover:bg-zinc-50"
                >
                  <span>Admin</span>
                </Link>
              )}
              <div className="my-1 border-t border-zinc-200" />
              <button
                onClick={handleSignOut}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-zinc-900 transition-colors hover:bg-zinc-50"
              >
                <span>Sign out</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
