"use client";

import { useState, useTransition } from "react";
import { Bell, BellPlus, BellRing } from "lucide-react";
import { toast } from "sonner";
import { toggleRegionAlert } from "@/app/actions/alerts";

export default function CreateAlertButton({ region, initialActive }: { region: string; initialActive: boolean }) {
  const [active, setActive] = useState(initialActive);
  const [pending, start] = useTransition();

  const onClick = () => {
    const next = !active;
    setActive(next);
    start(async () => {
      const res = await toggleRegionAlert(region);
      if (!res.success) {
        setActive(!next);
        toast.error("Could not update alert");
        return;
      }
      if (res.active) {
        toast.custom((t) => (
          <div className="rounded-2xl bg-zinc-900 text-white shadow-lg p-4 pr-8 max-w-sm">
            <div className="flex items-start gap-3">
              <div className="mt-0.5"><BellRing className="h-5 w-5" /></div>
              <div>
                <div className="font-semibold">Job alert created</div>
                <div className="text-sm/6 opacity-80">We'll send alerts for new {region} roles. Manage in notification settings.</div>
              </div>
              <button onClick={() => toast.dismiss(t)} className="ml-auto text-white/70 hover:text-white">✕</button>
            </div>
          </div>
        ));
      } else {
        toast("Alert turned off", { description: `No longer alerting for ${region}.` });
      }
    });
  };

  const Icon = active ? Bell : BellPlus;
  const label = active ? `Alert on for ${region}` : `Create job alert for ${region}`;

  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      aria-label={label}
      disabled={pending}
      className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-[15px] text-zinc-700 shadow-sm hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300 active:scale-95 transition-all"
    >
      <Icon className="h-4 w-4" />
      <span className="hidden sm:inline">{active ? "Alert on" : "Create job alert"}</span>
    </button>
  );
}

