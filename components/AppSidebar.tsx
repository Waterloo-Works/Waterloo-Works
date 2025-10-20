import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/utils/prisma";
import { SidebarProfileMenu } from "./SidebarProfileMenu";
import { SidebarNav } from "./SidebarNav";
import { ThemeToggle } from "./ThemeToggle";

type NavItem = {
  label: string;
  href: string;
  iconName: string;
  section?: "primary" | "secondary";
  disabled?: boolean;
};

const nav: NavItem[] = [
  { label: "Explore", href: "/explore", iconName: "Compass", section: "primary" },
  { label: "Inbox", href: "/inbox", iconName: "Mail", section: "primary", disabled: true },
  { label: "Saved", href: "/bookmarks", iconName: "SquareStack", section: "primary" },
  { label: "Jobs", href: "/job-search", iconName: "Building2", section: "secondary" },
  { label: "Companies", href: "/companies", iconName: "IdCard", section: "secondary" },
  { label: "Resources", href: "/resources", iconName: "BookOpen", section: "secondary" },
  { label: "Events", href: "/events", iconName: "Calendar", section: "secondary" },
];

export async function AppSidebar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isAdmin = false;
  if (user) {
    const record = await prisma.user.findUnique({ where: { id: user.id } });
    isAdmin = !!record?.isAdmin;
  }

  return (
    <aside className="sticky top-0 z-40 hidden h-svh w-44 shrink-0 border-r border-zinc-100 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/70 dark:border-zinc-800 dark:bg-zinc-950/80 dark:supports-[backdrop-filter]:bg-zinc-950/70 lg:block">
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between gap-2 px-4 py-4">
          <Link href="/explore" className="text-sm font-header italic text-zinc-900 dark:text-zinc-100">
            waterloo.app
          </Link>
          <ThemeToggle />
        </div>

        <SidebarNav items={nav} />

        <SidebarProfileMenu user={user} isAdmin={isAdmin} />
      </div>
    </aside>
  );
}

export default AppSidebar;
