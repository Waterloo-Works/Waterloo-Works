"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

const items = [
  { label: "Explore", href: "/explore" },
  { label: "Feed", href: "/feed" },
  { label: "Jobs", href: "/job-search" },
  { label: "Events", href: "/events" },
  { label: "People", href: "/people" },
  { label: "Employers", href: "/employers" },
  { label: "Notifications", href: "/notifications" },
  { label: "Inbox", href: "/inbox" },
];

export default function MobileNav() {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

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
    <div className="relative" ref={containerRef}>
      <button
        aria-label={open ? "Close menu" : "Open menu"}
        className="rounded-md p-2 text-zinc-700 hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>
      {open && (
        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 mx-2 rounded-2xl border border-zinc-200 bg-white shadow-xl">
          <nav className="max-h-[60vh] overflow-y-auto p-5">
            <ul className="space-y-6">
              {items.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="block text-2xl font-semibold tracking-tight text-zinc-900"
                    onClick={() => setOpen(false)}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      )}
    </div>
  );
}
