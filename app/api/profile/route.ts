import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/utils/prisma";

/**
 * GET /api/profile
 * Fetch the current user's profile
 */
export async function GET(request: NextRequest) {
	try {
		const supabase = await createClient();
		const {
			data: { user },
			error: authError,
		} = await supabase.auth.getUser();

		if (authError || !user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const profile = await prisma.userProfile.findUnique({
			where: { userId: user.id },
		});

		if (!profile) {
			return NextResponse.json({ error: "Profile not found" }, { status: 404 });
		}

		return NextResponse.json(profile);
	} catch (error) {
		console.error("Error fetching profile:", error);
		return NextResponse.json(
			{ error: "Failed to fetch profile" },
			{ status: 500 }
		);
	}
}

/**
 * POST /api/profile
 * Create or update user profile
 */
export async function POST(request: NextRequest) {
	try {
		const supabase = await createClient();
		const {
			data: { user },
			error: authError,
		} = await supabase.auth.getUser();

		if (authError || !user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const data = await request.json();

		// Calculate completion score
		const completionScore = calculateCompletionScore(data);
		const isComplete = completionScore >= 80;

		// Upsert profile
		const profile = await prisma.userProfile.upsert({
			where: { userId: user.id },
			create: {
				userId: user.id,
				...data,
				completionScore,
				isComplete,
			},
			update: {
				...data,
				completionScore,
				isComplete,
				updatedAt: new Date(),
			},
		});

		return NextResponse.json(profile);
	} catch (error) {
		console.error("Error creating/updating profile:", error);
		return NextResponse.json(
			{ error: "Failed to save profile" },
			{ status: 500 }
		);
	}
}

/**
 * PATCH /api/profile
 * Partially update user profile
 */
export async function PATCH(request: NextRequest) {
	try {
		const supabase = await createClient();
		const {
			data: { user },
			error: authError,
		} = await supabase.auth.getUser();

		if (authError || !user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const data = await request.json();

		// Get existing profile to merge data
		const existingProfile = await prisma.userProfile.findUnique({
			where: { userId: user.id },
		});

		if (!existingProfile) {
			return NextResponse.json(
				{ error: "Profile not found. Create profile first." },
				{ status: 404 }
			);
		}

		// Merge and calculate new completion score
		const mergedData = { ...existingProfile, ...data };
		const completionScore = calculateCompletionScore(mergedData);
		const isComplete = completionScore >= 80;

		// Update profile
		const profile = await prisma.userProfile.update({
			where: { userId: user.id },
			data: {
				...data,
				completionScore,
				isComplete,
				updatedAt: new Date(),
			},
		});

		return NextResponse.json(profile);
	} catch (error) {
		console.error("Error updating profile:", error);
		return NextResponse.json(
			{ error: "Failed to update profile" },
			{ status: 500 }
		);
	}
}

/**
 * DELETE /api/profile
 * Delete user profile
 */
export async function DELETE(request: NextRequest) {
	try {
		const supabase = await createClient();
		const {
			data: { user },
			error: authError,
		} = await supabase.auth.getUser();

		if (authError || !user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		await prisma.userProfile.delete({
			where: { userId: user.id },
		});

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Error deleting profile:", error);
		return NextResponse.json(
			{ error: "Failed to delete profile" },
			{ status: 500 }
		);
	}
}

/**
 * Calculate profile completeness score
 */
function calculateCompletionScore(data: Record<string, unknown>): number {
	let score = 0;
	const weights = {
		headline: 8,
		location: 3,
		resumeUrl: 15,
		currentRole: 10,
		yearsOfExperience: 5,
		experienceSummary: 12,
		skills: 15,
		primarySkills: 10,
		degree: 8,
		school: 5,
		desiredRoles: 5,
		desiredLocations: 2,
		portfolioUrl: 2,
	};

    Object.entries(weights).forEach(([field, weight]) => {
        const value = data[field];
        const hasValue = Array.isArray(value)
            ? (value as unknown[]).length > 0
            : Boolean(value);
        if (hasValue) {
            score += weight;
        }
    });

	return Math.min(score, 100);
}
