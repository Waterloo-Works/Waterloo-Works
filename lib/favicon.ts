"use server";

/**
 * Fetches a favicon URL for a given website URL
 * Uses Google's favicon service as a reliable fallback
 */
export async function getFaviconUrl(websiteUrl: string | null): Promise<string | null> {
	if (!websiteUrl) return null;

	try {
		// Parse the URL to get the domain
		const url = new URL(
			websiteUrl.startsWith("http") ? websiteUrl : `https://${websiteUrl}`
		);
		const domain = url.hostname;

		// Use Google's favicon service - it automatically finds and caches favicons
		return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
	} catch (error) {
		console.error("Error getting favicon:", error);
		return null;
	}
}
