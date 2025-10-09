"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toggleRegionAlert } from "@/app/actions/alerts";

export function useRegionAlerts() {
  return useQuery<{ map: Record<string, boolean> }>({
    queryKey: ["alerts", "regions"],
    queryFn: async () => {
      const res = await fetch("/api/alerts/regions", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load alerts");
      return res.json();
    },
  });
}

export function useToggleRegionAlert() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (region: string) => await toggleRegionAlert(region),
    onMutate: async (region: string) => {
      await qc.cancelQueries({ queryKey: ["alerts", "regions"] });
      const prev = qc.getQueryData<{ map: Record<string, boolean> }>(["alerts", "regions"]);
      if (prev) {
        const current = !!prev.map[region];
        qc.setQueryData(["alerts", "regions"], { map: { ...prev.map, [region]: !current } });
      }
      return { prev } as const;
    },
    onError: (_err, _region, ctx) => {
      if (ctx?.prev) qc.setQueryData(["alerts", "regions"], ctx.prev);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ["alerts", "regions"] }),
  });
}

