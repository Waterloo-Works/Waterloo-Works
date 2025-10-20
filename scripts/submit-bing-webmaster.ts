// Export empty object to make this file a module (prevents global scope conflicts)
export {};

const BING_API_KEY = process.env.BING_WEBMASTER_API_KEY || "";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://waterloo.app";

interface SubmitUrlBatchOptions {
	urls: string[];
	apiKey: string;
}

async function submitToBingWebmaster({ urls, apiKey }: SubmitUrlBatchOptions) {
	console.log(`\n📡 Submitting ${urls.length} URLs to Bing Webmaster API...`);

	const endpoint = `https://ssl.bing.com/webmaster/api.svc/json/SubmitUrlbatch?apikey=${apiKey}`;

	const body = {
		siteUrl: SITE_URL,
		urlList: urls,
	};

	try {
		const response = await fetch(endpoint, {
			method: "POST",
			headers: {
				"Content-Type": "application/json; charset=utf-8",
			},
			body: JSON.stringify(body),
		});

		if (response.ok) {
			const data = await response.json();
			console.log("✅ Successfully submitted URLs to Bing Webmaster");
			console.log(`Status: ${response.status} ${response.statusText}`);
			console.log(`Response:`, data);
			return true;
		} else {
			const text = await response.text();
			console.error("❌ Failed to submit URLs");
			console.error(`Status: ${response.status} ${response.statusText}`);
			console.error(`Response: ${text}`);
			return false;
		}
	} catch (error) {
		console.error("❌ Error submitting to Bing Webmaster:", error);
		return false;
	}
}

async function getUrlsFromSitemap(): Promise<string[]> {
	console.log("📄 Reading sitemap...");

	try {
		const sitemapUrl = `${SITE_URL}/sitemap.xml`;
		const response = await fetch(sitemapUrl);

		if (!response.ok) {
			throw new Error(`Failed to fetch sitemap: ${response.statusText}`);
		}

		const xml = await response.text();
		const urlMatches = xml.matchAll(/<loc>(.*?)<\/loc>/g);
		const urls = Array.from(urlMatches, (match) => match[1]);

		console.log(`✅ Found ${urls.length} URLs in sitemap\n`);
		return urls;
	} catch (error) {
		console.error("❌ Error reading sitemap:", error);
		throw error;
	}
}

async function main() {
	console.log("🚀 Bing Webmaster URL Submission Script");
	console.log(`Site: ${SITE_URL}`);
	console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

	// Check for API key
	if (!BING_API_KEY) {
		console.error("❌ Error: BING_WEBMASTER_API_KEY environment variable is not set");
		console.log("\n📝 To get your Bing Webmaster API key:");
		console.log("1. Go to https://www.bing.com/webmasters");
		console.log("2. Add and verify your site");
		console.log("3. Go to Settings > API Access");
		console.log("4. Copy your API key");
		console.log("\nThen run:");
		console.log("  export BING_WEBMASTER_API_KEY=your_api_key_here");
		console.log("  pnpm tsx scripts/submit-bing-webmaster.ts");
		process.exit(1);
	}

	try {
		const urls = await getUrlsFromSitemap();

		if (urls.length === 0) {
			console.log("⚠️  No URLs found in sitemap");
			return;
		}

		// Bing Webmaster API supports up to 10,000 URLs per request
		if (urls.length <= 10000) {
			await submitToBingWebmaster({ urls, apiKey: BING_API_KEY });
		} else {
			console.log(`⚠️  Found ${urls.length} URLs, will submit in batches of 10,000`);
			for (let i = 0; i < urls.length; i += 10000) {
				const batch = urls.slice(i, i + 10000);
				console.log(`\nBatch ${Math.floor(i / 10000) + 1}:`);
				await submitToBingWebmaster({ urls: batch, apiKey: BING_API_KEY });
			}
		}

		console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
		console.log("✨ Done! Your URLs have been submitted to Bing Webmaster");
	} catch (error) {
		console.error("\n❌ Script failed:", error);
		process.exit(1);
	}
}

main();
