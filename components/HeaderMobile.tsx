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
    <header className="fixed inset-x-0 top-0 z-30 flex h-14 items-center justify-between border-b border-zinc-200 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/70 md:hidden dark:border-zinc-800 dark:bg-zinc-900/80 dark:supports-[backdrop-filter]:bg-zinc-900/70" style={{ paddingLeft: 'max(1rem, env(safe-area-inset-left))', paddingRight: 'max(1rem, env(safe-area-inset-right))' }}>
      <div className="flex-shrink-0">
        <MobileNav />
      </div>
      <div className="absolute left-1/2 -translate-x-1/2">
        <Link href="/explore" className="text-base font-header italic text-zinc-900 dark:text-zinc-100">
          waterloo.app
        </Link>
      </div>
      {user ? (
        <div className="ml-auto flex-shrink-0" />
      ) : (
        <div className="ml-auto flex-shrink-0">
          <Link href="/login" className="rounded-full border border-zinc-300 px-4 py-1.5 text-sm text-zinc-900 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-800">
            Sign in
          </Link>
        </div>
      )}
    </header>
  );
}
