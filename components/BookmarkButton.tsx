"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { toast } from "sonner";
import { useBookmarkedIds, useToggleBookmark } from "@/hooks/useBookmarks";
import posthog from 'posthog-js';

export default function BookmarkButton({ jobId, initial }: { jobId: string; initial: boolean }) {
  // Local fallback until query loads
  const [local, setLocal] = useState(initial);
  const { data } = useBookmarkedIds();
  const isInCache = useMemo(() => (data?.ids ? data.ids.includes(jobId) : undefined), [data, jobId]);
  const bookmarked = isInCache ?? local;
  const { mutateAsync } = useToggleBookmark();
  const router = useRouter();

  const onClick = () => {
    const next = !bookmarked;
    posthog.capture('job_bookmark_toggled', { job_id: jobId, bookmarked: next });
    // Optimistic local flip only when cache not yet hydrated
    if (isInCache === undefined) setLocal(next);
    (async () => {
      try {
        const res = await mutateAsync(jobId);
        if (!res.success) {
          if (isInCache === undefined) setLocal(!next);
          if (res.error === "Not authenticated") {
            toast("Sign in to save", { description: "You need to sign in to bookmark jobs." });
            router.push("/login");
          } else if (res.error) {
            toast.error(res.error);
          } else {
            toast.error("Could not update bookmark");
          }
          return;
        }
        if (res.bookmarked) {
          toast("Saved", { description: "Added to your bookmarks." });
        } else {
          toast("Removed", { description: "Removed from bookmarks." });
        }
      } catch (e) {
        if (isInCache === undefined) setLocal(!next);
        toast.error("Could not update bookmark");
      }
    })();
  };

  return (
    <button
      aria-label={bookmarked ? "Remove bookmark" : "Save job"}
      aria-pressed={bookmarked}
      onClick={onClick}
      // interactive during optimistic update; Query cache handles UI state
      className="rounded-full p-2 text-zinc-700 hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300 transition-transform active:scale-95"
    >
      {bookmarked ? <BookmarkCheck className="h-5 w-5" /> : <Bookmark className="h-5 w-5" />}
    </button>
  );
}
