import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/utils/prisma";
import { redirect } from "next/navigation";

export default async function HeaderDesktop() {
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
    <header className="sticky top-0 z-30 hidden h-14 items-center justify-end border-b border-white/20 bg-transparent px-6 backdrop-blur supports-[backdrop-filter]:bg-transparent md:flex">
      {/* Profile menu moved to sidebar bottom */}
    </header>
  );
}
