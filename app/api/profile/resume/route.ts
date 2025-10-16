import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/utils/prisma";
import { uploadResumeServer, deleteResumeServer } from "@/lib/profile/resume-upload-server";
import { parseResumeWithReducto } from "@/lib/resume/reducto-parser";
import { extractProfileWithOllama, validateExtractedData } from "@/lib/resume/ollama-extractor";

/**
 * POST /api/profile/resume
 * Upload and parse resume
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

		// Parse form data
		const formData = await request.formData();
		const file = formData.get("resume") as File;

		if (!file) {
			return NextResponse.json({ error: "No file provided" }, { status: 400 });
		}

		// 1. Upload to Supabase Storage (using authenticated server client)
		console.log('📤 Uploading resume to Supabase...');
		const uploadResult = await uploadResumeServer(supabase, user.id, file);
		console.log('✅ Resume uploaded:', uploadResult.path);

		// 2. Convert File to Buffer for Reducto
		const arrayBuffer = await file.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);

		// 3. Parse with Reducto
		console.log('📄 Parsing resume with Reducto...');
		let resumeText = '';
		let parsingError: string | null = null;

		try {
			const reductoResult = await parseResumeWithReducto(buffer, file.name);
			resumeText = reductoResult.text;
			console.log(`✅ Reducto parsing completed in ${reductoResult.duration.toFixed(2)}s`);
			console.log(`📝 Extracted ${resumeText.length} characters`);
		} catch (error) {
			parsingError = error instanceof Error ? error.message : 'Reducto parsing failed';
			console.error('❌ Reducto parsing error:', error);
		}

		// 4. Extract structured data with Ollama (only if we have text)
		let extractedData = null;
		let extractionError: string | null = null;

		if (resumeText && !parsingError) {
			try {
				console.log('🤖 Extracting profile data with Ollama...');
				const rawExtracted = await extractProfileWithOllama(resumeText);
				extractedData = validateExtractedData(rawExtracted);
				console.log('✅ Profile data extracted successfully');
				console.log(`   - Skills: ${extractedData.skills.length}`);
				console.log(`   - Primary Skills: ${extractedData.primarySkills.length}`);
				console.log(`   - Experience: ${extractedData.yearsOfExperience || 'N/A'} years`);
			} catch (error) {
				extractionError = error instanceof Error ? error.message : 'Extraction failed';
				console.error('❌ Ollama extraction error:', error);
			}
		}

		// 5. Calculate completion score with extracted data
		const profileData = extractedData ? {
			...extractedData,
			resumeUrl: uploadResult.url,
			resumeFileName: uploadResult.fileName,
			resumeUploadedAt: new Date(),
			resumeParsedAt: new Date(),
			resumeRawText: resumeText,
			resumeParsingError: parsingError || extractionError,
		} : {
			resumeUrl: uploadResult.url,
			resumeFileName: uploadResult.fileName,
			resumeUploadedAt: new Date(),
			resumeRawText: resumeText,
			resumeParsingError: parsingError || extractionError,
		};

		// Simple completion score calculation
		const calculateCompletionScore = (data: any): number => {
			let score = 0;
			if (data.resumeUrl) score += 15;
			if (data.headline) score += 8;
			if (data.location) score += 5;
			if (data.currentRole) score += 7;
			if (data.yearsOfExperience) score += 5;
			if (data.experienceSummary) score += 10;
			if (data.skills?.length > 0) score += 15;
			if (data.primarySkills?.length > 0) score += 10;
			if (data.degree) score += 7;
			if (data.school) score += 5;
			if (data.graduationYear) score += 3;
			if (data.desiredRoles?.length > 0) score += 5;
			if (data.linkedinUrl || data.githubUrl || data.portfolioUrl) score += 5;
			return Math.min(score, 100);
		};

		const completionScore = calculateCompletionScore(profileData);

		// 6. Upsert profile with extracted data
		console.log('💾 Saving profile to database...');
		const profile = await prisma.userProfile.upsert({
			where: { userId: user.id },
			create: {
				userId: user.id,
				...profileData,
				completionScore,
				isComplete: completionScore >= 80
			},
			update: {
				...profileData,
				completionScore,
				isComplete: completionScore >= 80
			}
		});

		console.log('✅ Profile saved! Completion score:', completionScore);

		return NextResponse.json({
			success: true,
			profile,
			extractedData,
			parsingError: parsingError || extractionError,
			completionScore
		});
	} catch (error) {
		console.error("Error uploading resume:", error);
		return NextResponse.json(
			{
				error:
					error instanceof Error ? error.message : "Failed to upload resume",
			},
			{ status: 500 }
		);
	}
}

/**
 * DELETE /api/profile/resume
 * Delete user's resume
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

		// Get profile
		const profile = await prisma.userProfile.findUnique({
			where: { userId: user.id },
		});

		if (!profile || !profile.resumeUrl) {
			return NextResponse.json({ error: "No resume found" }, { status: 404 });
		}

		// Extract path from URL (remove Supabase domain and signed URL params)
		// Format: resumes/{userId}/{filename}
		const urlParts = profile.resumeUrl.split("/");
		const resumesIndex = urlParts.findIndex((part) => part === "resumes");
		if (resumesIndex !== -1) {
			const path = urlParts.slice(resumesIndex).join("/").split("?")[0];

			// Delete from storage (using authenticated server client)
			await deleteResumeServer(supabase, path);
		}

		// Update profile
		await prisma.userProfile.update({
			where: { id: profile.id },
			data: {
				resumeUrl: null,
				resumeFileName: null,
				resumeUploadedAt: null,
			},
		});

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Error deleting resume:", error);
		return NextResponse.json(
			{ error: "Failed to delete resume" },
			{ status: 500 }
		);
	}
}
