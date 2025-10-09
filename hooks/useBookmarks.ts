"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toggleBookmark } from "@/app/actions/bookmarks";

export function useBookmarkedIds() {
  return useQuery<{ ids: string[] }>({
    queryKey: ["bookmarks", "ids"],
    queryFn: async () => {
      const res = await fetch("/api/bookmarks/ids", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load bookmarks");
      return res.json();
    },
  });
}

export function useToggleBookmark() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (jobId: string) => await toggleBookmark(jobId),
    onMutate: async (jobId: string) => {
      await qc.cancelQueries({ queryKey: ["bookmarks", "ids" ] });
      const prev = qc.getQueryData<{ ids: string[] }>(["bookmarks", "ids"]);
      if (prev) {
        const exists = prev.ids.includes(jobId);
        const next = exists ? prev.ids.filter((id) => id !== jobId) : [...prev.ids, jobId];
        qc.setQueryData(["bookmarks", "ids"], { ids: next });
      }
      return { prev } as const;
    },
    onError: (_err, _jobId, ctx) => {
      if (ctx?.prev) qc.setQueryData(["bookmarks", "ids"], ctx.prev);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["bookmarks", "ids"] });
    },
  });
}

