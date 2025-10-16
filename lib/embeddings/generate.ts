import { ollama } from "../profile/ollama-client";
import { UserProfile, Job } from "@prisma/client";

/**
 * Default embedding model
 * Options: nomic-embed-text, mxbai-embed-large, llama2 (with embeddings)
 */
const DEFAULT_EMBEDDING_MODEL = process.env.OLLAMA_EMBEDDING_MODEL || "nomic-embed-text";

/**
 * Generate embedding vector from text using Ollama
 */
export async function generateEmbedding(
	text: string,
	model: string = DEFAULT_EMBEDDING_MODEL
): Promise<number[]> {
	if (!text || text.trim().length === 0) {
		throw new Error("Cannot generate embedding from empty text");
	}

	try {
		const embedding = await ollama.generateEmbedding(model, text);
		return embedding;
	} catch (error) {
		console.error("Embedding generation error:", error);
		throw new Error(
			`Failed to generate embedding: ${error instanceof Error ? error.message : "Unknown error"}`
		);
	}
}

/**
 * Generate profile embedding from UserProfile
 * Combines multiple fields into a rich text representation
 */
export async function generateProfileEmbedding(
	profile: UserProfile
): Promise<{ embedding: number[]; version: string }> {
	// Build comprehensive profile text for embedding
	const profileParts = [
		// Professional identity
		profile.headline && `Professional: ${profile.headline}`,
		profile.currentRole && `Current Role: ${profile.currentRole}`,

		// Experience
		profile.yearsOfExperience &&
			`Experience: ${profile.yearsOfExperience} years`,
		profile.experienceSummary && `Background: ${profile.experienceSummary}`,

		// Skills (most important for matching)
		profile.primarySkills.length > 0 &&
			`Core Skills: ${profile.primarySkills.join(", ")}`,
		profile.skills.length > 0 && `All Skills: ${profile.skills.join(", ")}`,

		// Education
		profile.degree && profile.school && `Education: ${profile.degree} from ${profile.school}`,

		// Job preferences
		profile.desiredRoles.length > 0 &&
			`Seeking: ${profile.desiredRoles.join(", ")}`,
		profile.desiredLocations.length > 0 &&
			`Locations: ${profile.desiredLocations.join(", ")}`,
		profile.location && `Currently in: ${profile.location}`,
		profile.openToRemote && "Open to remote work",
	].filter(Boolean);

	const profileText = profileParts.join("\n");

	if (profileText.length < 20) {
		throw new Error("Profile has insufficient data to generate meaningful embedding");
	}

	const embedding = await generateEmbedding(profileText);

	return {
		embedding,
		version: `ollama-${DEFAULT_EMBEDDING_MODEL}-v1`,
	};
}

/**
 * Generate job embedding from Job posting
 * Creates rich representation for matching candidates
 */
export async function generateJobEmbedding(
	job: Job & { requiredSkills?: string[]; preferredSkills?: string[] }
): Promise<{ embedding: number[]; version: string }> {
	// Build comprehensive job text for embedding
	const jobParts = [
		// Core job info
		`Position: ${job.position}`,
		`Company: ${job.company}`,
		`Location: ${job.location}`,
		`Type: ${job.employmentType}`,

		// Salary info
		job.salaryMin &&
			job.salaryMax &&
			`Salary: $${job.salaryMin} - $${job.salaryMax}`,

		// Job description
		job.notes && `Description: ${job.notes}`,

		// Skills (if we add them to Job model later)
		job.requiredSkills &&
			job.requiredSkills.length > 0 &&
			`Required Skills: ${job.requiredSkills.join(", ")}`,
		job.preferredSkills &&
			job.preferredSkills.length > 0 &&
			`Preferred Skills: ${job.preferredSkills.join(", ")}`,
	].filter(Boolean);

	const jobText = jobParts.join("\n");

	if (jobText.length < 20) {
		throw new Error("Job has insufficient data to generate meaningful embedding");
	}

	const embedding = await generateEmbedding(jobText);

	return {
		embedding,
		version: `ollama-${DEFAULT_EMBEDDING_MODEL}-v1`,
	};
}

/**
 * Calculate cosine similarity between two embedding vectors
 * Returns a value between 0 and 1 (1 = identical, 0 = completely different)
 */
export function cosineSimilarity(vec1: number[], vec2: number[]): number {
	if (vec1.length !== vec2.length) {
		throw new Error("Vectors must have the same length");
	}

	let dotProduct = 0;
	let magnitude1 = 0;
	let magnitude2 = 0;

	for (let i = 0; i < vec1.length; i++) {
		dotProduct += vec1[i] * vec2[i];
		magnitude1 += vec1[i] * vec1[i];
		magnitude2 += vec2[i] * vec2[i];
	}

	magnitude1 = Math.sqrt(magnitude1);
	magnitude2 = Math.sqrt(magnitude2);

	if (magnitude1 === 0 || magnitude2 === 0) {
		return 0;
	}

	return dotProduct / (magnitude1 * magnitude2);
}

/**
 * Find top N most similar items using cosine similarity
 * Useful for in-memory matching when you have embeddings loaded
 */
export function findTopMatches<T>(
	queryEmbedding: number[],
	items: Array<{ embedding: number[]; item: T }>,
	topN: number = 10
): Array<{ item: T; similarity: number }> {
	const similarities = items
		.map(({ embedding, item }) => ({
			item,
			similarity: cosineSimilarity(queryEmbedding, embedding),
		}))
		.sort((a, b) => b.similarity - a.similarity)
		.slice(0, topN);

	return similarities;
}

/**
 * Batch generate embeddings for multiple texts
 * More efficient than generating one at a time
 */
export async function generateBatchEmbeddings(
	texts: string[],
	model: string = DEFAULT_EMBEDDING_MODEL
): Promise<number[][]> {
	// Currently, Ollama doesn't support batch embeddings in a single call
	// So we'll generate them sequentially (could be parallelized with Promise.all if needed)
	const embeddings: number[][] = [];

	for (const text of texts) {
		const embedding = await generateEmbedding(text, model);
		embeddings.push(embedding);
	}

	return embeddings;
}

/**
 * Serialize embedding to JSON string for storage
 */
export function serializeEmbedding(embedding: number[]): string {
	return JSON.stringify(embedding);
}

/**
 * Deserialize embedding from JSON string
 */
export function deserializeEmbedding(embeddingJson: string): number[] {
	try {
		const parsed = JSON.parse(embeddingJson);
		if (!Array.isArray(parsed)) {
			throw new Error("Invalid embedding format");
		}
		return parsed;
	} catch (error) {
		throw new Error(
			`Failed to deserialize embedding: ${error instanceof Error ? error.message : "Unknown error"}`
		);
	}
}
