/**
 * Ollama Client for local LLM inference
 * Docs: https://github.com/ollama/ollama/blob/main/docs/api.md
 */

export interface OllamaGenerateRequest {
	model: string;
	prompt: string;
	stream?: boolean;
	format?: "json"; // Request JSON output
	options?: {
		temperature?: number;
		top_p?: number;
		top_k?: number;
		num_predict?: number; // Max tokens
	};
}

export interface OllamaGenerateResponse {
	model: string;
	created_at: string;
	response: string;
	done: boolean;
	context?: number[];
	total_duration?: number;
	load_duration?: number;
	prompt_eval_count?: number;
	eval_count?: number;
	eval_duration?: number;
}

export interface OllamaEmbeddingRequest {
	model: string;
	prompt: string;
}

export interface OllamaEmbeddingResponse {
	embedding: number[];
}

export class OllamaClient {
	private baseUrl: string;

	constructor(baseUrl: string = "http://localhost:11434") {
		this.baseUrl = baseUrl;
	}

	/**
	 * Generate text completion from Ollama
	 */
	async generate(
		request: OllamaGenerateRequest
	): Promise<OllamaGenerateResponse> {
		const response = await fetch(`${this.baseUrl}/api/generate`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ ...request, stream: false }),
		});

		if (!response.ok) {
			throw new Error(
				`Ollama request failed: ${response.status} ${response.statusText}`
			);
		}

		return response.json();
	}

	/**
	 * Generate embeddings from Ollama
	 */
	async generateEmbedding(
		model: string,
		text: string
	): Promise<number[]> {
		const response = await fetch(`${this.baseUrl}/api/embeddings`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ model, prompt: text }),
		});

		if (!response.ok) {
			throw new Error(
				`Ollama embedding request failed: ${response.status} ${response.statusText}`
			);
		}

		const data: OllamaEmbeddingResponse = await response.json();
		return data.embedding;
	}

	/**
	 * List available models
	 */
	async listModels(): Promise<string[]> {
		const response = await fetch(`${this.baseUrl}/api/tags`);

		if (!response.ok) {
			throw new Error("Failed to fetch models");
		}

		interface ModelInfo {
			name: string;
		}

		interface ModelsResponse {
			models?: ModelInfo[];
		}

		const data = await response.json() as ModelsResponse;
		return data.models?.map((m) => m.name) || [];
	}

	/**
	 * Check if Ollama is running
	 */
	async ping(): Promise<boolean> {
		try {
			const response = await fetch(this.baseUrl, {
				method: "GET",
			});
			return response.ok;
		} catch {
			return false;
		}
	}
}

// Singleton instance
export const ollama = new OllamaClient(
	process.env.OLLAMA_BASE_URL || "http://localhost:11434"
);
