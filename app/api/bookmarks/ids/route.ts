import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/utils/prisma";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ ids: [] });
    const rows = await (prisma as any)?.bookmark?.findMany?.({
      where: { userId: user.id },
      select: { jobId: true },
    });
    return NextResponse.json({ ids: Array.isArray(rows) ? rows.map((r) => r.jobId) : [] });
  } catch {
    return NextResponse.json({ ids: [] });
  }
}

