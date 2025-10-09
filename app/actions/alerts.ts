"use server";

import { prisma } from "@/utils/prisma";
import { createClient } from "@/utils/supabase/server";

export async function toggleRegionAlert(region: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const existing = await (prisma as any).jobAlert.findUnique({
    where: { userId_region: { userId: user.id, region } },
  });

  if (!existing) {
    await (prisma as any).jobAlert.create({ data: { userId: user.id, region, active: true } });
    return { success: true, active: true };
  }

  const updated = await (prisma as any).jobAlert.update({
    where: { id: existing.id },
    data: { active: !existing.active },
  });
  return { success: true, active: updated.active };
}

export async function getRegionAlertMap() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Map<string, boolean>();
  const rows = await (prisma as any).jobAlert.findMany({
    where: { userId: user.id },
    select: { region: true, active: true },
  });
  return new Map(rows.map((r) => [r.region, r.active] as const));
}
