"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";

const items = [
  { label: "Explore", href: "/explore" },
  { label: "Jobs", href: "/job-search" },
  { label: "Companies", href: "/companies" },
  { label: "Resources", href: "/resources" },
  { label: "Events", href: "/events" },
];

export default function MobileNav() {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!open) return;
      const target = e.target as Node;
      if (containerRef.current && !containerRef.current.contains(target)) {
        setOpen(false);
      }
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, [open]);

  return (
    <div className="relative flex items-center" ref={containerRef}>
      <button
        aria-label={open ? "Close menu" : "Open menu"}
        className="rounded-md p-2 text-zinc-700 hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 touch-manipulation dark:text-zinc-300 dark:hover:bg-zinc-800"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>
      {open && (
        <div className="fixed inset-x-0 top-14 z-50 pointer-events-none" style={{ paddingLeft: 'env(safe-area-inset-left)', paddingRight: 'env(safe-area-inset-right)' }}>
          <div className="pointer-events-auto w-full rounded-none border-b border-zinc-200 bg-white shadow-md dark:border-zinc-800 dark:bg-zinc-900">
            <nav className="max-h-[50vh] overflow-y-auto px-5 py-5">
              <ul className="space-y-6">
                {items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      prefetch={true}
                      className="block text-2xl font-semibold tracking-tight text-zinc-900 transition-opacity duration-150 dark:text-zinc-100"
                      onClick={(e) => {
                        e.preventDefault();
                        setOpen(false);
                        startTransition(() => {
                          router.push(item.href);
                        });
                      }}
                      onMouseEnter={() => router.prefetch(item.href)}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}
