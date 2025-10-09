import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/utils/prisma";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ map: {} });
    const rows = await (prisma as any)?.jobAlert?.findMany?.({
      where: { userId: user.id },
      select: { region: true, active: true },
    });
    const map: Record<string, boolean> = {};
    if (Array.isArray(rows)) rows.forEach((r: any) => (map[r.region] = r.active));
    return NextResponse.json({ map });
  } catch {
    return NextResponse.json({ map: {} });
  }
}

