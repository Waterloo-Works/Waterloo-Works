import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/utils/prisma";
import { redirect } from "next/navigation";
import MobileNav from "@/components/MobileNav";

export default async function HeaderMobile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  async function handleSignOut() {
    "use server";
    const s = await createClient();
    await s.auth.signOut();
    redirect("/");
  }

  const initials = (() => {
    if (user?.user_metadata?.full_name) {
      const parts = String(user.user_metadata.full_name).trim().split(/\s+/);
      if (parts.length >= 2) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
      return parts[0][0].toUpperCase();
    }
    return (user?.email?.[0] || "U").toUpperCase();
  })();

  return (
    <header className="fixed inset-x-0 top-0 z-30 flex h-14 items-center justify-between border-b border-zinc-200 bg-white/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-white/80 md:hidden">
      <MobileNav />
      <div className="absolute left-1/2 -translate-x-1/2">
        <Link href="/explore" className="text-base font-header italic text-zinc-900">
          waterloo.works
        </Link>
      </div>
      {user ? (
        <div className="relative group ml-auto">
          <button className="flex h-9 w-9 items-center justify-center rounded-full bg-black text-[#F5F1E8] text-sm font-medium hover:bg-zinc-800 transition-colors" aria-label="User menu">
            {initials}
          </button>
          <div className="invisible absolute right-0 z-50 mt-3 w-56 rounded-2xl border border-zinc-200 bg-white opacity-0 shadow-sm transition-all duration-200 group-hover:visible group-hover:opacity-100">
            <div className="py-3">
              <div className="border-b border-zinc-200 px-5 py-3">
                <p className="truncate text-sm font-medium text-zinc-900">{user.user_metadata?.full_name || user.email}</p>
                <p className="mt-0.5 truncate text-xs text-zinc-600">{user.email}</p>
              </div>
              <div className="py-2">
                <Link href="/profile" className="flex items-center gap-3 px-5 py-2.5 text-sm text-zinc-900 transition-colors hover:bg-zinc-50">
                  <span>Profile</span>
                </Link>
                <Link href="/my-jobs" className="flex items-center gap-3 px-5 py-2.5 text-sm text-zinc-900 transition-colors hover:bg-zinc-50">
                  <span>My Job Submissions</span>
                </Link>
              </div>
              <form action={handleSignOut} className="border-t border-zinc-200 pt-2">
                <button type="submit" className="flex w-full items-center gap-3 px-5 py-2.5 text-left text-sm text-zinc-900 transition-colors hover:bg-zinc-50">
                  <span>Sign out</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      ) : (
        <Link href="/login" className="rounded-full border border-zinc-300 px-4 py-1.5 text-sm text-zinc-900 hover:bg-zinc-50">
          Sign in
        </Link>
      )}
    </header>
  );
}
