import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/utils/prisma";

type BookmarkRow = { jobId: string };

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ ids: [] });
    const models = prisma as unknown as {
      bookmark?: { findMany: (args: { where: { userId: string }; select: { jobId: true } }) => Promise<BookmarkRow[]> };
    };
    if (!models.bookmark) return NextResponse.json({ ids: [] });
    const rows = await models.bookmark.findMany({
      where: { userId: user.id },
      select: { jobId: true },
    });
    return NextResponse.json({ ids: rows.map((r) => r.jobId) });
  } catch {
    return NextResponse.json({ ids: [] });
  }
}
