"use client";

import { useState } from "react";
import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function PeerRunHint() {
  const [open, setOpen] = useState(false);
  return (
    <div className="ml-2 inline-flex items-center align-top">
      {/* Desktop tooltip */}
      <div className="hidden md:inline-flex">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                aria-label="What does peer‑run mean?"
                className="rounded-full p-1 text-zinc-500 hover:text-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
              >
                <Info className="h-5 w-5" />
              </button>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs text-sm">
              Peer‑run means alum curate and moderate listings. Roles are shared directly with people who might actually want them.
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      {/* Mobile fallback */}
      <div className="md:hidden">
        <button
          onClick={() => setOpen((v) => !v)}
          className="rounded-full p-1 text-zinc-500 hover:text-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
          aria-expanded={open}
          aria-controls="peer-run-info"
        >
          <Info className="h-5 w-5" />
        </button>
      </div>
      {open && (
        <div id="peer-run-info" className="mt-2 block w-full md:hidden">
          <p className="rounded-xl bg-zinc-50 p-3 text-sm text-zinc-700 ring-1 ring-zinc-200">
            Peer‑run means alum curate and moderate listings. Roles are shared directly with people who might actually want them.
          </p>
        </div>
      )}
    </div>
  );
}

