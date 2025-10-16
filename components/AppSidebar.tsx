"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Compass,
  SquareStack,
  Mail,
  Building2,
  Calendar,
  IdCard,
  BookOpen,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";

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
  { label: "Profile", href: "/profile", icon: User, section: "primary" },
  { label: "Jobs", href: "/job-search", icon: Building2, section: "secondary" },
  { label: "Companies", href: "/companies", icon: IdCard, section: "secondary" },
  { label: "Resources", href: "/resources", icon: BookOpen, section: "secondary" },
  { label: "Events", href: "/events", icon: Calendar, section: "secondary" },
];

export function AppSidebar() {
  const pathname = usePathname();

  function Item({ item }: { item: NavItem }) {
    const active = pathname === item.href || pathname.startsWith(item.href + "/");
    return (
      <Link
        href={item.href}
        aria-current={active ? "page" : undefined}
        className={cn(
          "flex items-center gap-2 rounded-xl px-2.5 py-2 text-sm transition-colors",
          "hover:bg-zinc-100",
          active ? "bg-zinc-100 text-zinc-900" : "text-zinc-700"
        )}
      >
        <item.icon className="h-5 w-5" strokeWidth={2} />
        <span className="font-medium">{item.label}</span>
      </Link>
    );
  }

  return (
    <aside className="sticky top-0 z-40 hidden h-screen w-48 shrink-0 border-r border-zinc-200 bg-white md:block">
      <div className="flex h-full flex-col">
        <div className="flex items-center gap-3 p-5">
          <Link href="/explore" className="text-base font-serif italic text-zinc-900">
            waterloo.works
          </Link>
        </div>

        <nav className="px-3 space-y-1">
          {nav
            .filter((n) => n.section === "primary")
            .map((n) => (
              <Item key={n.href} item={n} />
            ))}
        </nav>

        <div className="my-5 border-t border-zinc-200" />

        <nav className="px-3 space-y-1">
          {nav
            .filter((n) => n.section === "secondary")
            .map((n) => (
              <Item key={n.href} item={n} />
            ))}
        </nav>

        <div className="mt-auto p-4 text-xs text-zinc-500" />
      </div>
    </aside>
  );
}

export default AppSidebar;
