import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/utils/prisma";
import { redirect } from "next/navigation";
import MobileNav from "@/components/MobileNav";

export default async function HeaderMinimal() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isAdmin = false;
  if (user) {
    const record = await prisma.user.findUnique({ where: { id: user.id } });
    isAdmin = !!record?.isAdmin;
  }

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
    <header className="relative fixed inset-x-0 top-0 z-30 h-14 px-4 md:px-6 border-b border-zinc-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 flex items-center justify-between md:sticky md:inset-auto md:top-0">
      {/* Left: Hamburger (mobile/tablet only) */}
      <div className="lg:hidden">
        <MobileNav />
      </div>

      {/* Center: Brand (mobile/tablet only) */}
      <div className="absolute left-1/2 -translate-x-1/2 lg:hidden">
        <Link href="/explore" className="text-base font-header italic text-zinc-900">
          waterloo.works
        </Link>
      </div>

      {/* Page header slot (desktop only) */}
      <div id="page-header-slot" className="hidden md:flex items-center gap-3 text-zinc-900" />

      {/* Right: Auth/avatar (always aligned far right) */}
      <div className="ml-auto flex items-center gap-3">
        {user ? (
          <div className="relative group">
            <button
              className="w-9 h-9 bg-black text-[#F5F1E8] rounded-full flex items-center justify-center text-sm font-medium hover:bg-zinc-800 transition-colors"
              aria-label="User menu"
            >
              {initials}
            </button>
            <div className="absolute right-0 mt-3 w-56 rounded-2xl border border-zinc-200 bg-white shadow-sm opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div className="py-3">
                <div className="px-5 py-3 border-b border-zinc-200">
                  <p className="text-sm font-medium text-zinc-900 truncate">
                    {user.user_metadata?.full_name || user.email}
                  </p>
                  <p className="text-xs text-zinc-600 truncate mt-0.5">{user.email}</p>
                </div>
                <div className="py-2">
                  <Link
                    href="/my-jobs"
                    className="flex items-center gap-3 px-5 py-2.5 text-sm text-zinc-900 hover:bg-zinc-50 transition-colors"
                  >
                    <span>My Job Submissions</span>
                  </Link>
                  {isAdmin && (
                    <Link
                      href="/admin"
                      className="flex items-center gap-3 px-5 py-2.5 text-sm text-zinc-900 hover:bg-zinc-50 transition-colors"
                    >
                      <span>Admin</span>
                    </Link>
                  )}
                </div>
                <form action={handleSignOut} className="pt-2 border-t border-zinc-200">
                  <button
                    type="submit"
                    className="w-full flex items-center gap-3 text-left px-5 py-2.5 text-sm text-zinc-900 hover:bg-zinc-50 transition-colors"
                  >
                    <span>Sign out</span>
                  </button>
                </form>
              </div>
            </div>
          </div>
        ) : (
          <Link
            href="/login"
            className="px-4 py-1.5 rounded-full border border-black/20 text-sm text-black hover:bg-black/5"
          >
            Sign in
          </Link>
        )}
      </div>
    </header>
  );
}
