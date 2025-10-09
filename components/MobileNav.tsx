"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";

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

  return (
    <>
      <button
        aria-label="Open menu"
        className="rounded-md p-2 text-zinc-700 hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
        onClick={() => setOpen(true)}
      >
        <Menu className="h-6 w-6" />
      </button>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-full max-w-full md:max-w-xl p-6">
          <div className="flex items-center justify-end">
            <button
              aria-label="Close menu"
              className="rounded-md p-2 text-zinc-700 hover:bg-zinc-100"
              onClick={() => setOpen(false)}
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="mt-4 space-y-6">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block text-2xl font-semibold tracking-tight text-zinc-900"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </SheetContent>
      </Sheet>
    </>
  );
}

