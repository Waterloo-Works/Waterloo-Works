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
    <header className="h-14 px-4 md:px-6 border-b border-transparent flex items-center justify-between">
      <div className="flex items-center">
        {/* Hamburger menu appears below lg; sidebar handles desktop */}
        <div className="lg:hidden">
          <MobileNav />
        </div>
      </div>
      <div className="flex items-center gap-3">
        {user ? (
          <div className="relative group">
            <button
              className="w-9 h-9 bg-black text-[#F5F1E8] rounded-full flex items-center justify-center text-sm font-medium hover:bg-gray-800 transition-colors"
              aria-label="User menu"
            >
              {initials}
            </button>
            <div className="absolute right-0 mt-3 w-56 bg-[#F5F1E8] border border-black/20 rounded-2xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div className="py-3">
                <div className="px-5 py-3 border-b border-black/10">
                  <p className="text-sm font-medium text-black truncate">
                    {user.user_metadata?.full_name || user.email}
                  </p>
                  <p className="text-xs text-gray-600 truncate mt-0.5">{user.email}</p>
                </div>
                <div className="py-2">
                  <Link
                    href="/my-jobs"
                    className="flex items-center gap-2 px-5 py-2.5 text-sm text-black hover:bg-black/5 transition-colors"
                  >
                    <span className="text-base">📋</span>
                    <span>My Job Submissions</span>
                  </Link>
                  <Link
                    href="/post-job"
                    className="flex items-center gap-2 px-5 py-2.5 text-sm text-black hover:bg-black/5 transition-colors"
                  >
                    <span className="text-base">✏️</span>
                    <span>Post a Job</span>
                  </Link>
                  {isAdmin && (
                    <Link
                      href="/admin"
                      className="flex items-center gap-2 px-5 py-2.5 text-sm text-black hover:bg-black/5 transition-colors"
                    >
                      <span className="text-base">🛠️</span>
                      <span>Admin</span>
                    </Link>
                  )}
                </div>
                <form action={handleSignOut} className="pt-2 border-t border-black/10">
                  <button
                    type="submit"
                    className="w-full flex items-center gap-2 text-left px-5 py-2.5 text-sm text-black hover:bg-black/5 transition-colors"
                  >
                    <span className="text-base">👋</span>
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
