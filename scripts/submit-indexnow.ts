import { readFileSync } from "fs";
import { join } from "path";

const INDEXNOW_KEY = "c2625de7b6514de28e9ed33e320098e9";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://waterloo.works";

// IndexNow API endpoints (can submit to any, they share the index)
const INDEXNOW_ENDPOINTS = [
	"https://api.indexnow.org/indexnow",
	"https://www.bing.com/indexnow",
	"https://yandex.com/indexnow",
];

interface SubmitUrlsOptions {
	urls: string[];
	endpoint?: string;
}

async function submitToIndexNow({ urls, endpoint = INDEXNOW_ENDPOINTS[0] }: SubmitUrlsOptions) {
	console.log(`\n📡 Submitting ${urls.length} URLs to IndexNow...`);
	console.log(`Endpoint: ${endpoint}\n`);

	const body = {
		host: new URL(SITE_URL).hostname,
		key: INDEXNOW_KEY,
		keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
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
			console.log("✅ Successfully submitted URLs to IndexNow");
			console.log(`Status: ${response.status} ${response.statusText}`);
			return true;
		} else {
			const text = await response.text();
			console.error("❌ Failed to submit URLs");
			console.error(`Status: ${response.status} ${response.statusText}`);
			console.error(`Response: ${text}`);
			return false;
		}
	} catch (error) {
		console.error("❌ Error submitting to IndexNow:", error);
		return false;
	}
}

async function getUrlsFromSitemap(): Promise<string[]> {
	console.log("📄 Reading sitemap...");

	try {
		// Fetch the sitemap from the site
		const sitemapUrl = `${SITE_URL}/sitemap.xml`;
		const response = await fetch(sitemapUrl);

		if (!response.ok) {
			throw new Error(`Failed to fetch sitemap: ${response.statusText}`);
		}

		const xml = await response.text();

		// Extract URLs from sitemap XML
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
	console.log("🚀 IndexNow URL Submission Script");
	console.log(`Site: ${SITE_URL}`);
	console.log(`Key: ${INDEXNOW_KEY}`);
	console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

	try {
		// Get URLs from sitemap
		const urls = await getUrlsFromSitemap();

		if (urls.length === 0) {
			console.log("⚠️  No URLs found in sitemap");
			return;
		}

		// IndexNow has a limit of 10,000 URLs per request
		// For most sites, we can submit all at once
		if (urls.length <= 10000) {
			await submitToIndexNow({ urls });
		} else {
			// Batch into chunks of 10,000
			console.log(`⚠️  Found ${urls.length} URLs, will submit in batches of 10,000`);
			for (let i = 0; i < urls.length; i += 10000) {
				const batch = urls.slice(i, i + 10000);
				console.log(`\nBatch ${Math.floor(i / 10000) + 1}:`);
				await submitToIndexNow({ urls: batch });
			}
		}

		console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
		console.log("✨ Done! Your URLs have been submitted to IndexNow");
		console.log("\n📝 Next steps:");
		console.log("1. Verify the key file is accessible:");
		console.log(`   ${SITE_URL}/${INDEXNOW_KEY}.txt`);
		console.log("2. Submit sitemap to Google Search Console:");
		console.log("   https://search.google.com/search-console");
		console.log("3. Submit sitemap to Bing Webmaster Tools:");
		console.log("   https://www.bing.com/webmasters");
	} catch (error) {
		console.error("\n❌ Script failed:", error);
		process.exit(1);
	}
}

main();
