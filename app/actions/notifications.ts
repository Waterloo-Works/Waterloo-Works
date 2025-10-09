"use server";

import { prisma } from "@/utils/prisma";
import { createClient } from "@/utils/supabase/server";

type NotificationModel = {
  createMany(args: { data: { userId: string; type: string; payload: unknown }[] }): Promise<unknown>;
  findMany(args: { where: { userId: string }; orderBy: { createdAt: "desc" }; take?: number }): Promise<{ id: string; type: string; payload: unknown; createdAt: Date; readAt: Date | null }[]>;
  updateMany(args: { where: { userId: string; readAt: null }; data: { readAt: Date } }): Promise<unknown>;
};

export async function listNotifications(limit = 50) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [] as { id: string; type: string; payload: unknown; createdAt: Date; readAt: Date | null }[];
  const models = prisma as unknown as { notification?: NotificationModel };
  if (!models.notification) return [] as { id: string; type: string; payload: unknown; createdAt: Date; readAt: Date | null }[];
  return await models.notification.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: limit });
}

export async function markAllRead() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };
  const models = prisma as unknown as { notification?: NotificationModel };
  if (!models.notification) return { success: true };
  await models.notification.updateMany({ where: { userId: user.id, readAt: null }, data: { readAt: new Date() } });
  return { success: true };
}
