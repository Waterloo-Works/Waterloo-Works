"use server";

import { prisma } from "@/utils/prisma";
import { createClient } from "@/utils/supabase/server";

type BookmarkModel = {
  findUnique(args: { where: { userId_jobId: { userId: string; jobId: string } } }): Promise<{ id: string } | null>;
  delete(args: { where: { id: string } }): Promise<unknown>;
  create(args: { data: { userId: string; jobId: string } }): Promise<unknown>;
  findMany(args: { where: { userId: string }; select: { jobId: true } }): Promise<{ jobId: string }[]>;
};

export async function toggleBookmark(jobId: string) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Not authenticated" } as const;

    const models = prisma as unknown as { bookmark?: BookmarkModel };
    console.log("models", models);
        if (!models.bookmark) return { success: false, error: "Bookmarks are not enabled" } as const;

    const existing = await models.bookmark.findUnique({
      where: { userId_jobId: { userId: user.id, jobId } },
    });

    if (existing) {
      await models.bookmark.delete({ where: { id: existing.id } });
      return { success: true, bookmarked: false } as const;
    } else {
      await models.bookmark.create({ data: { userId: user.id, jobId } });
      return { success: true, bookmarked: true } as const;
    }
  } catch (e: unknown) {
    return { success: false, error: "Server error updating bookmark" } as const;
  }
}

export async function getBookmarkedJobIds() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return new Set<string>();
    const models = prisma as unknown as { bookmark?: BookmarkModel };
    if (!models.bookmark) return new Set<string>();
    const rows = await models.bookmark.findMany({
      where: { userId: user.id },
      select: { jobId: true },
    });
    return new Set(rows.map((r) => r.jobId));
  } catch {
    return new Set<string>();
  }
}
