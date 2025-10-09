"use server";

import { prisma } from "@/utils/prisma";
import { createClient } from "@/utils/supabase/server";

export async function toggleBookmark(jobId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const existing = await (prisma as any).bookmark.findUnique({
    where: { userId_jobId: { userId: user.id, jobId } },
  });

  if (existing) {
    await (prisma as any).bookmark.delete({ where: { id: existing.id } });
    return { success: true, bookmarked: false };
  } else {
    await (prisma as any).bookmark.create({ data: { userId: user.id, jobId } });
    return { success: true, bookmarked: true };
  }
}

export async function getBookmarkedJobIds() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Set<string>();
  const rows = await (prisma as any).bookmark.findMany({
    where: { userId: user.id },
    select: { jobId: true },
  });
  return new Set(rows.map((r) => r.jobId));
}
