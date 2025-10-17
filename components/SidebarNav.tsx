"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

type NavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  section?: "primary" | "secondary";
};

export function SidebarNav({ items }: { items: NavItem[] }) {
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
