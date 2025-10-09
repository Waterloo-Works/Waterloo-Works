import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/utils/prisma";

type JobAlertRow = { region: string; active: boolean };

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ map: {} });
    const models = prisma as unknown as {
      jobAlert?: { findMany: (args: { where: { userId: string }; select: { region: true; active: true } }) => Promise<JobAlertRow[]> };
    };
    if (!models.jobAlert) return NextResponse.json({ map: {} });
    const rows = await models.jobAlert.findMany({
      where: { userId: user.id },
      select: { region: true, active: true },
    });
    const map: Record<string, boolean> = {};
    rows.forEach((r) => (map[r.region] = r.active));
    return NextResponse.json({ map });
  } catch {
    return NextResponse.json({ map: {} });
  }
}
