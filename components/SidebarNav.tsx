"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTransition, useState } from "react";
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
  disabled?: boolean;
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
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [optimisticPath, setOptimisticPath] = useState<string | null>(null);

  function Item({ item }: { item: NavItem }) {
    const isCurrentRoute = pathname === item.href || pathname.startsWith(item.href + "/");
    const isOptimistic = optimisticPath === item.href;
    const active = isCurrentRoute || isOptimistic;
    const Icon = iconMap[item.iconName as keyof typeof iconMap];

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (isCurrentRoute) return; // Already on this page

      e.preventDefault();

      // Optimistically update UI immediately
      setOptimisticPath(item.href);

      // Navigate with transition
      startTransition(() => {
        router.push(item.href);
      });
    };

    const handleMouseEnter = () => {
      // Warm up the route on hover
      router.prefetch(item.href);
    };

    const content = (
      <>
        {/* Active rail */}
        <span
          className={cn(
            "absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-full",
            active && !item.disabled ? "bg-sidebar-primary" : "bg-transparent"
          )}
          aria-hidden
        />
        {Icon && <Icon className="h-4 w-4" strokeWidth={2} />}
        <span className="font-medium tracking-wide">{item.label}</span>
        {item.disabled && (
          <span className="ml-auto rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
            Soon
          </span>
        )}
      </>
    );

    if (item.disabled) {
      return (
        <div
          className={cn(
            "group relative flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors cursor-not-allowed opacity-50"
          )}
          title="Coming soon"
        >
          {content}
        </div>
      );
    }

    // Determine data-tour attribute based on href
    const dataTourAttr = item.href === "/job-search" ? "job-search" :
                         item.href === "/bookmarks" ? "bookmarks" :
                         item.href === "/alerts" ? "alerts" : undefined;

    return (
      <Link
        href={item.href}
        prefetch={true}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        aria-current={active ? "page" : undefined}
        data-tour={dataTourAttr}
        className={cn(
          "group relative flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all duration-150",
          active ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
          isPending && isOptimistic && "opacity-70"
        )}
      >
        {content}
      </Link>
    );
  }

  return (
    <>
      <nav className="px-2 space-y-1">
        {items
          .filter((n) => n.section === "primary")
          .map((n) => (
            <Item key={n.href} item={n} />
          ))}
      </nav>

      <div className="my-4 mx-2 border-t border-sidebar-border" />

      <nav className="px-2 space-y-1">
        {items
          .filter((n) => n.section === "secondary")
          .map((n) => (
            <Item key={n.href} item={n} />
          ))}
      </nav>
    </>
  );
}
