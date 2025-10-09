"use client";

import { useState } from "react";
import { Bell, BellPlus, BellRing } from "lucide-react";
import { toast } from "sonner";
import { useToggleRegionAlert } from "@/hooks/useAlerts";
import posthog from 'posthog-js';

export default function CreateAlertButton({ region, initialActive }: { region: string; initialActive: boolean }) {
  const [active, setActive] = useState(initialActive);
  const { mutateAsync } = useToggleRegionAlert();

  const onClick = () => {
    const next = !active;
    posthog.capture('job_alert_toggled', { region: region, active: next });
    setActive(next);
    (async () => {
      const res = await mutateAsync(region);
      if (!res.success) {
        setActive(!next);
        toast.error("Could not update alert");
        return;
      }
      if (res.active) {
        toast("Alert turned on", {
          description: `We’ll send alerts for new ${region} roles.`,
        });
      } else {
        toast("Alert turned off", { description: `No longer alerting for ${region}.` });
      }
    })();
  };

  const Icon = active ? Bell : BellPlus;
  const label = active ? `Alert on for ${region}` : `Create job alert for ${region}`;

  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      aria-label={label}
      // interactive during optimistic update
      className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-[15px] text-zinc-700 shadow-sm hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300 active:scale-95 transition-all"
    >
      <Icon className="h-4 w-4" />
      <span className="hidden sm:inline">{active ? "Alert on" : "Create job alert"}</span>
    </button>
  );
}
