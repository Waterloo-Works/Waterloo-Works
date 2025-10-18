"use client";

import Link from "next/link";
import { useState } from "react";
import { signOut as signOutAction } from "@/app/actions/auth";

type UserLite = {
  email?: string | null;
  user_metadata?: { full_name?: string } | null;
} | null;

export default function FloatingProfileMenu({ user, isAdmin = false }: { user: UserLite; isAdmin?: boolean }) {
  const [open, setOpen] = useState(false);

  if (!user) return null;

  const initials = (() => {
    const full = user?.user_metadata?.full_name || user?.email || "U";
    const parts = String(full).trim().split(/\s+/);
    if (parts.length >= 2) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    return (full[0] || "U").toUpperCase();
  })();

  const signOut = async () => {
    setOpen(false);
    await signOutAction();
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 md:bottom-6 md:right-6" style={{ paddingRight: "max(1rem, env(safe-area-inset-right))", paddingBottom: "max(.5rem, env(safe-area-inset-bottom))" }}>
      {/* Backdrop */}
      {open && <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />}

      {/* Button */}
      <button
        aria-label="Open profile menu"
        onClick={() => setOpen((v) => !v)}
        className="relative z-50 flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-violet-600 text-white shadow-lg ring-1 ring-violet-400/20 backdrop-blur transition-all hover:shadow-xl hover:scale-105"
      >
        <span className="text-sm font-medium">{initials}</span>
      </button>

      {/* Menu opens upward */}
      {open && (
        <div className="absolute bottom-14 right-0 z-50 w-[220px] rounded-2xl border border-zinc-200 bg-white shadow-xl">
          <div className="py-2">
            <Link href="/profile" onClick={() => setOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-900 transition-colors hover:bg-zinc-50">
              <span>Profile</span>
            </Link>
            <Link href="/my-jobs" onClick={() => setOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-900 transition-colors hover:bg-zinc-50">
              <span>My Job Submissions</span>
            </Link>
            {isAdmin && (
              <Link href="/admin" onClick={() => setOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-900 transition-colors hover:bg-zinc-50">
                <span>Admin</span>
              </Link>
            )}
            <div className="my-1 border-t border-zinc-200" />
            <button onClick={signOut} className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-zinc-900 transition-colors hover:bg-zinc-50">
              <span>Sign out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

