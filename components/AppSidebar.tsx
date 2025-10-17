import Link from "next/link";
import {
  Compass,
  SquareStack,
  Mail,
  Building2,
  Calendar,
  IdCard,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/utils/prisma";
import { SidebarProfileMenu } from "./SidebarProfileMenu";
import { SidebarNav } from "./SidebarNav";

type NavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  section?: "primary" | "secondary";
};

const nav: NavItem[] = [
  { label: "Explore", href: "/explore", icon: Compass, section: "primary" },
  { label: "Inbox", href: "/inbox", icon: Mail, section: "primary" },
  { label: "Saved", href: "/bookmarks", icon: SquareStack, section: "primary" },
  { label: "Jobs", href: "/job-search", icon: Building2, section: "secondary" },
  { label: "Companies", href: "/companies", icon: IdCard, section: "secondary" },
  { label: "Resources", href: "/resources", icon: BookOpen, section: "secondary" },
  { label: "Events", href: "/events", icon: Calendar, section: "secondary" },
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
    <aside className="sticky top-0 z-40 hidden h-screen w-48 shrink-0 border-r border-zinc-200 bg-white md:block">
      <div className="flex h-full flex-col">
        <div className="flex items-center gap-3 p-5">
          <Link href="/explore" className="text-base font-header italic text-zinc-900">
            waterloo.works
          </Link>
        </div>

        <SidebarNav items={nav} />

        <SidebarProfileMenu user={user} isAdmin={isAdmin} />
      </div>
    </aside>
  );
}

export default AppSidebar;
