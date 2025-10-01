"use server";

import { prisma } from "@/utils/prisma";
import { createClient } from "@/utils/supabase/server";

export async function createUserRecord(data: {
	userId: string;
	email: string;
	fullName?: string;
	source?: string;
}) {
	try {
		await prisma.user.upsert({
			where: { id: data.userId },
			create: {
				id: data.userId,
				email: data.email,
				fullName: data.fullName,
				source: data.source,
			},
			update: {
				fullName: data.fullName,
				source: data.source,
			},
		});

		return { success: true };
	} catch (error) {
		console.error("Error creating user record:", error);
		return { success: false, error: "Failed to create user record" };
	}
}

export async function getCurrentUser() {
	try {
		const supabase = await createClient();
		const {
			data: { user },
		} = await supabase.auth.getUser();

		if (!user) {
			return null;
		}

		const dbUser = await prisma.user.findUnique({
			where: { id: user.id },
		});

		return dbUser;
	} catch (error) {
		console.error("Error getting current user:", error);
		return null;
	}
}

export async function updateUserSource(source: string) {
	try {
		const supabase = await createClient();
		const {
			data: { user },
		} = await supabase.auth.getUser();

		if (!user) {
			return { success: false, error: "Not authenticated" };
		}

		await prisma.user.update({
			where: { id: user.id },
			data: { source },
		});

		return { success: true };
	} catch (error) {
		console.error("Error updating user source:", error);
		return { success: false, error: "Failed to update user source" };
	}
}
