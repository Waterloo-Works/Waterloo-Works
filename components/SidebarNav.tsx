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
} from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = {
  label: string;
  href: string;
  iconName: string;
  section?: "primary" | "secondary";
};

const iconMap = {
  Compass,
  SquareStack,
  Mail,
  Building2,
  Calendar,
  IdCard,
  BookOpen,
};

export function SidebarNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  function Item({ item }: { item: NavItem }) {
    const active = pathname === item.href || pathname.startsWith(item.href + "/");
    const Icon = iconMap[item.iconName as keyof typeof iconMap];

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
        {Icon && <Icon className="h-5 w-5" strokeWidth={2} />}
        <span className="font-medium">{item.label}</span>
      </Link>
    );
  }

  return (
    <>
      <nav className="px-3 space-y-1">
        {items
          .filter((n) => n.section === "primary")
          .map((n) => (
            <Item key={n.href} item={n} />
          ))}
      </nav>

      <div className="my-5 border-t border-zinc-200" />

      <nav className="px-3 space-y-1">
        {items
          .filter((n) => n.section === "secondary")
          .map((n) => (
            <Item key={n.href} item={n} />
          ))}
      </nav>
    </>
  );
}
