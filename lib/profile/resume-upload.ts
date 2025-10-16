import { createClient } from "@/utils/supabase/client";

export interface ResumeUploadResult {
	url: string;
	path: string;
	fileName: string;
}

export interface ResumeUploadOptions {
	maxSizeBytes?: number; // Default: 5MB
	allowedTypes?: string[];
}

const DEFAULT_OPTIONS: Required<ResumeUploadOptions> = {
	maxSizeBytes: 5 * 1024 * 1024, // 5MB
	allowedTypes: [
		"application/pdf",
		"application/msword", // .doc
		"application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
	],
};

/**
 * Validates a resume file before upload
 */
export function validateResumeFile(
	file: File,
	options: ResumeUploadOptions = {}
): { valid: boolean; error?: string } {
	const opts = { ...DEFAULT_OPTIONS, ...options };

	// Check file size
	if (file.size > opts.maxSizeBytes) {
		return {
			valid: false,
			error: `File too large. Maximum size is ${opts.maxSizeBytes / 1024 / 1024}MB`,
		};
	}

	// Check file type
	if (!opts.allowedTypes.includes(file.type)) {
		return {
			valid: false,
			error: `Invalid file type. Allowed types: PDF, DOC, DOCX`,
		};
	}

	// Check filename
	if (!file.name || file.name.length > 255) {
		return {
			valid: false,
			error: "Invalid filename",
		};
	}

	return { valid: true };
}

/**
 * Upload a resume file to Supabase Storage
 * Files are stored at: resumes/{userId}/{timestamp}-{filename}
 */
export async function uploadResume(
	userId: string,
	file: File,
	options: ResumeUploadOptions = {}
): Promise<ResumeUploadResult> {
	// Validate file
	const validation = validateResumeFile(file, options);
	if (!validation.valid) {
		throw new Error(validation.error);
	}

	const supabase = createClient();

	// Create unique filename with timestamp
	const timestamp = Date.now();
	const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
	const path = `${userId}/${timestamp}-${sanitizedFileName}`;

	// Upload to Supabase Storage
	const { data, error } = await supabase.storage
		.from("resumes")
		.upload(path, file, {
			cacheControl: "3600",
			upsert: false, // Don't overwrite existing files
		});

	if (error) {
		throw new Error(`Upload failed: ${error.message}`);
	}

	// Get signed URL (valid for 1 year)
	const { data: urlData } = await supabase.storage
		.from("resumes")
		.createSignedUrl(path, 60 * 60 * 24 * 365); // 1 year

	if (!urlData?.signedUrl) {
		throw new Error("Failed to generate signed URL");
	}

	return {
		url: urlData.signedUrl,
		path: data.path,
		fileName: file.name,
	};
}

/**
 * Delete a resume file from Supabase Storage
 */
export async function deleteResume(path: string): Promise<void> {
	const supabase = createClient();

	const { error } = await supabase.storage.from("resumes").remove([path]);

	if (error) {
		throw new Error(`Delete failed: ${error.message}`);
	}
}

/**
 * Get a new signed URL for an existing resume
 * Useful when the previous signed URL has expired
 */
export async function getResumeSignedUrl(
	path: string,
	expiresIn: number = 60 * 60 * 24 * 365 // 1 year default
): Promise<string> {
	const supabase = createClient();

	const { data, error } = await supabase.storage
		.from("resumes")
		.createSignedUrl(path, expiresIn);

	if (error || !data?.signedUrl) {
		throw new Error("Failed to generate signed URL");
	}

	return data.signedUrl;
}

/**
 * Download resume file as text content for parsing
 */
export async function downloadResumeContent(path: string): Promise<string> {
	const supabase = createClient();

	const { data, error } = await supabase.storage.from("resumes").download(path);

	if (error || !data) {
		throw new Error("Failed to download resume");
	}

	// Convert Blob to text
	const text = await data.text();
	return text;
}

/**
 * List all resumes for a user
 */
export async function listUserResumes(userId: string) {
	const supabase = createClient();

	const { data, error } = await supabase.storage
		.from("resumes")
		.list(userId, {
			limit: 100,
			offset: 0,
			sortBy: { column: "created_at", order: "desc" },
		});

	if (error) {
		throw new Error(`Failed to list resumes: ${error.message}`);
	}

	return data || [];
}
