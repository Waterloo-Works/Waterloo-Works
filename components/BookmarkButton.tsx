"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { toast } from "sonner";
import { toggleBookmark } from "@/app/actions/bookmarks";

export default function BookmarkButton({ jobId, initial }: { jobId: string; initial: boolean }) {
  const [bookmarked, setBookmarked] = useState(initial);
  const [pending, start] = useTransition();
  const router = useRouter();

  const onClick = () => {
    const next = !bookmarked;
    setBookmarked(next); // optimistic
    start(async () => {
      try {
        const res = await toggleBookmark(jobId);
        if (!res.success) {
          setBookmarked(!next);
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
        setBookmarked(!next);
        toast.error("Could not update bookmark");
      }
    });
  };

  return (
    <button
      aria-label={bookmarked ? "Remove bookmark" : "Save job"}
      aria-pressed={bookmarked}
      onClick={onClick}
      disabled={pending}
      className="rounded-full p-2 text-zinc-700 hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300 transition-transform active:scale-95"
    >
      {bookmarked ? <BookmarkCheck className="h-5 w-5" /> : <Bookmark className="h-5 w-5" />}
    </button>
  );
}
