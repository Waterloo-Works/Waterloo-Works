import { ollama } from "./ollama-client";
import { EmploymentType } from "@prisma/client";

export interface ParsedResumeData {
	// Basic Info
	fullName?: string;
	email?: string;
	phone?: string;
	location?: string;
	headline?: string; // Professional summary/title

	// Experience
	currentRole?: string;
	yearsOfExperience?: number;
	experienceSummary?: string;
	workHistory?: Array<{
		company: string;
		position: string;
		startDate?: string;
		endDate?: string;
		description?: string;
	}>;

	// Skills
	skills?: string[];
	primarySkills?: string[]; // Top 3-5 skills

	// Education
	degree?: string;
	school?: string;
	graduationYear?: number;
	education?: Array<{
		school: string;
		degree: string;
		graduationYear?: number;
	}>;

	// Preferences (may not be in resume, but we try)
	desiredRoles?: string[];

	// Links
	linkedinUrl?: string;
	githubUrl?: string;
	portfolioUrl?: string;
	personalWebsite?: string;
}

/**
 * Extract text from PDF resume
 * Note: This is a placeholder. For production, use a PDF parsing library like:
 * - pdf-parse (npm install pdf-parse)
 * - pdfjs-dist
 * Or use a service like Adobe PDF Extract API
 */
export async function extractTextFromPDF(file: File): Promise<string> {
	// For now, we'll assume the text is already extracted
	// In production, implement proper PDF text extraction
	try {
		const text = await file.text();
		return text;
	} catch (error) {
		throw new Error("Failed to extract text from PDF. Please use a text-based PDF or try a different format.");
	}
}

/**
 * Parse resume using Ollama LLM
 */
export async function parseResumeWithOllama(
	resumeText: string,
	model: string = "llama3.2" // Default to llama3.2, can use llama2, mistral, etc.
): Promise<ParsedResumeData> {
	const prompt = `You are a resume parser. Extract structured information from the following resume text.

Resume Text:
"""
${resumeText}
"""

Extract and return ONLY a JSON object with the following structure (omit fields if not found):
{
  "fullName": "string",
  "email": "string",
  "phone": "string",
  "location": "string (city, state/country)",
  "headline": "string (professional title or summary)",
  "currentRole": "string (most recent job title)",
  "yearsOfExperience": number (estimate total years),
  "experienceSummary": "string (brief summary of experience)",
  "workHistory": [
    {
      "company": "string",
      "position": "string",
      "startDate": "string (YYYY-MM or YYYY)",
      "endDate": "string (YYYY-MM or YYYY or 'Present')",
      "description": "string (responsibilities)"
    }
  ],
  "skills": ["array of all technical and professional skills"],
  "primarySkills": ["array of top 3-5 most important skills"],
  "education": [
    {
      "school": "string",
      "degree": "string",
      "graduationYear": number
    }
  ],
  "degree": "string (highest/most recent degree)",
  "school": "string (most recent school)",
  "graduationYear": number,
  "linkedinUrl": "string",
  "githubUrl": "string",
  "portfolioUrl": "string",
  "personalWebsite": "string"
}

Return ONLY the JSON object, no additional text or explanation.`;

	try {
		const response = await ollama.generate({
			model,
			prompt,
			format: "json", // Request JSON output
			options: {
				temperature: 0.1, // Low temperature for consistent extraction
				num_predict: 2000, // Max tokens for response
			},
		});

		// Parse the JSON response
		let rawData: unknown;
		try {
			rawData = JSON.parse(response.response);
		} catch (parseError) {
			// If JSON parsing fails, try to extract JSON from the response
			const jsonMatch = response.response.match(/\{[\s\S]*\}/);
			if (jsonMatch) {
				rawData = JSON.parse(jsonMatch[0]);
			} else {
				throw new Error("Failed to parse JSON from Ollama response");
			}
		}

		// Post-process and validate the data
		return cleanParsedData(rawData as Record<string, unknown>);
	} catch (error) {
		console.error("Resume parsing error:", error);
		throw new Error(
			`Failed to parse resume with Ollama: ${error instanceof Error ? error.message : "Unknown error"}`
		);
	}
}

/**
 * Clean and validate parsed resume data
 */
function cleanParsedData(data: Record<string, unknown>): ParsedResumeData {
	const cleaned: ParsedResumeData = {};

	// Basic info
	if (data.fullName) cleaned.fullName = String(data.fullName).trim();
	if (data.email) cleaned.email = String(data.email).trim().toLowerCase();
	if (data.phone) cleaned.phone = String(data.phone).trim();
	if (data.location) cleaned.location = String(data.location).trim();
	if (data.headline) cleaned.headline = String(data.headline).trim();

	// Experience
	if (data.currentRole) cleaned.currentRole = String(data.currentRole).trim();
	if (data.yearsOfExperience)
		cleaned.yearsOfExperience = parseInt(String(data.yearsOfExperience));
	if (data.experienceSummary)
		cleaned.experienceSummary = String(data.experienceSummary).trim();
	if (Array.isArray(data.workHistory)) cleaned.workHistory = data.workHistory;

	// Skills - ensure arrays
	if (Array.isArray(data.skills)) {
		cleaned.skills = data.skills.map((s) => String(s).trim()).filter(Boolean);
	}
	if (Array.isArray(data.primarySkills)) {
		cleaned.primarySkills = data.primarySkills
			.map((s) => String(s).trim())
			.filter(Boolean)
			.slice(0, 5); // Max 5 primary skills
	} else if (cleaned.skills && cleaned.skills.length > 0) {
		// If primarySkills not provided, use first 5 skills
		cleaned.primarySkills = cleaned.skills.slice(0, 5);
	}

	// Education
	if (data.degree) cleaned.degree = String(data.degree).trim();
	if (data.school) cleaned.school = String(data.school).trim();
	if (data.graduationYear) cleaned.graduationYear = parseInt(String(data.graduationYear));
	if (Array.isArray(data.education)) cleaned.education = data.education;

	// Desired roles (might not be in resume)
	if (Array.isArray(data.desiredRoles)) {
		cleaned.desiredRoles = data.desiredRoles
			.map((r) => String(r).trim())
			.filter(Boolean);
	}

	// Links
	if (data.linkedinUrl && isValidUrl(String(data.linkedinUrl)))
		cleaned.linkedinUrl = String(data.linkedinUrl);
	if (data.githubUrl && isValidUrl(String(data.githubUrl)))
		cleaned.githubUrl = String(data.githubUrl);
	if (data.portfolioUrl && isValidUrl(String(data.portfolioUrl)))
		cleaned.portfolioUrl = String(data.portfolioUrl);
	if (data.personalWebsite && isValidUrl(String(data.personalWebsite)))
		cleaned.personalWebsite = String(data.personalWebsite);

	return cleaned;
}

/**
 * Validate URL
 */
function isValidUrl(urlString: string): boolean {
	try {
		const url = new URL(urlString);
		return url.protocol === "http:" || url.protocol === "https:";
	} catch {
		return false;
	}
}

/**
 * Calculate profile completeness score based on parsed data
 */
export function calculateCompletionScore(data: ParsedResumeData): number {
	let score = 0;
	const weights = {
		fullName: 5,
		email: 5,
		location: 3,
		headline: 8,
		currentRole: 10,
		yearsOfExperience: 5,
		experienceSummary: 12,
		skills: 15,
		primarySkills: 10,
		degree: 8,
		school: 5,
		workHistory: 10,
		linkedinUrl: 2,
		githubUrl: 2,
	};

	Object.entries(weights).forEach(([field, weight]) => {
		const value = data[field as keyof ParsedResumeData];
		if (Array.isArray(value) ? value.length > 0 : value) {
			score += weight;
		}
	});

	return Math.min(score, 100);
}

/**
 * Main function to parse resume from file
 */
export async function parseResume(
	file: File,
	options: { model?: string } = {}
): Promise<ParsedResumeData> {
	// Extract text from file
	let resumeText: string;

	if (file.type === "application/pdf") {
		resumeText = await extractTextFromPDF(file);
	} else {
		// For DOC/DOCX, you'd need a library like mammoth.js
		// For now, just try to read as text
		resumeText = await file.text();
	}

	if (!resumeText || resumeText.trim().length < 50) {
		throw new Error(
			"Could not extract enough text from resume. Please ensure the file contains readable text."
		);
	}

	// Parse with Ollama
	return parseResumeWithOllama(resumeText, options.model);
}
