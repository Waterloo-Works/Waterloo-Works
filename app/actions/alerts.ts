"use server";

import { prisma } from "@/utils/prisma";
import { createClient } from "@/utils/supabase/server";

type JobAlertModel = {
  findUnique(args: { where: { userId_region: { userId: string; region: string } } }): Promise<{ id: string; active: boolean } | null>;
  create(args: { data: { userId: string; region: string; active: boolean } }): Promise<unknown>;
  update(args: { where: { id: string }; data: { active: boolean } }): Promise<{ active: boolean }>;
  findMany(args: { where: { userId: string }; select: { region: true; active: true } }): Promise<{ region: string; active: boolean }[]>;
};

export async function toggleRegionAlert(region: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const models = prisma as unknown as { jobAlert?: JobAlertModel };
  if (!models.jobAlert) return { success: false, error: "Alerts not initialized" };

  const existing = await models.jobAlert.findUnique({
    where: { userId_region: { userId: user.id, region } },
  });

  if (!existing) {
    await models.jobAlert.create({ data: { userId: user.id, region, active: true } });
    return { success: true, active: true };
  }

  const updated = await models.jobAlert.update({
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
  const models = prisma as unknown as { jobAlert?: JobAlertModel };
  if (!models.jobAlert) return new Map<string, boolean>();
  const rows = await models.jobAlert.findMany({
    where: { userId: user.id },
    select: { region: true, active: true },
  });
  return new Map(rows.map((r) => [r.region, r.active] as const));
}
