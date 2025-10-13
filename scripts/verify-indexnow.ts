const INDEXNOW_KEY = "c2625de7b6514de28e9ed33e320098e9";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://waterloo.works";

async function verifyKeyFile() {
	console.log("🔍 Verifying IndexNow key file...\n");

	const keyFileUrl = `${SITE_URL}/${INDEXNOW_KEY}.txt`;
	console.log(`Key file URL: ${keyFileUrl}`);

	try {
		const response = await fetch(keyFileUrl);

		if (response.ok) {
			const content = await response.text();
			const trimmedContent = content.trim();

			console.log(`✅ Key file is accessible`);
			console.log(`   Status: ${response.status} ${response.statusText}`);
			console.log(`   Content: "${trimmedContent}"`);

			if (trimmedContent === INDEXNOW_KEY) {
				console.log(`   ✅ Key matches expected value`);
				return true;
			} else {
				console.error(`   ❌ Key mismatch!`);
				console.error(`   Expected: "${INDEXNOW_KEY}"`);
				console.error(`   Got: "${trimmedContent}"`);
				return false;
			}
		} else {
			console.error(`❌ Key file not accessible`);
			console.error(`   Status: ${response.status} ${response.statusText}`);
			console.error(`   Make sure the file exists at: public/${INDEXNOW_KEY}.txt`);
			return false;
		}
	} catch (error) {
		console.error(`❌ Error fetching key file:`, error);
		return false;
	}
}

async function verifySitemap() {
	console.log("\n🗺️  Verifying sitemap...\n");

	const sitemapUrl = `${SITE_URL}/sitemap.xml`;
	console.log(`Sitemap URL: ${sitemapUrl}`);

	try {
		const response = await fetch(sitemapUrl);

		if (response.ok) {
			const xml = await response.text();
			const urlMatches = xml.matchAll(/<loc>(.*?)<\/loc>/g);
			const urls = Array.from(urlMatches, (match) => match[1]);

			console.log(`✅ Sitemap is accessible`);
			console.log(`   Status: ${response.status} ${response.statusText}`);
			console.log(`   Total URLs: ${urls.length}`);

			// Group by type
			const jobUrls = urls.filter((url) => url.includes("/jobs/"));
			const companyUrls = urls.filter((url) => url.includes("/companies/"));
			const blogUrls = urls.filter((url) => url.includes("/blog/"));
			const resourceUrls = urls.filter((url) => url.includes("/resources/"));
			const staticUrls = urls.filter(
				(url) =>
					!url.includes("/jobs/") &&
					!url.includes("/companies/") &&
					!url.includes("/blog/") &&
					!url.includes("/resources/")
			);

			console.log("\n   URL Breakdown:");
			console.log(`   - Static pages: ${staticUrls.length}`);
			console.log(`   - Job pages: ${jobUrls.length}`);
			console.log(`   - Company pages: ${companyUrls.length}`);
			console.log(`   - Blog pages: ${blogUrls.length}`);
			console.log(`   - Resource pages: ${resourceUrls.length}`);

			return true;
		} else {
			console.error(`❌ Sitemap not accessible`);
			console.error(`   Status: ${response.status} ${response.statusText}`);
			return false;
		}
	} catch (error) {
		console.error(`❌ Error fetching sitemap:`, error);
		return false;
	}
}

async function checkIndexingStatus() {
	console.log("\n📊 Checking Indexing Status...\n");

	console.log("To verify if your URLs are indexed:\n");

	console.log("1. Google Search:");
	console.log(`   site:${new URL(SITE_URL).hostname}`);
	console.log(`   https://www.google.com/search?q=site:${new URL(SITE_URL).hostname}\n`);

	console.log("2. Bing Search:");
	console.log(`   site:${new URL(SITE_URL).hostname}`);
	console.log(`   https://www.bing.com/search?q=site:${new URL(SITE_URL).hostname}\n`);

	console.log("3. Google Search Console:");
	console.log("   https://search.google.com/search-console");
	console.log("   - Check 'Coverage' report");
	console.log("   - View indexed vs. not indexed pages\n");

	console.log("4. Bing Webmaster Tools:");
	console.log("   https://www.bing.com/webmasters");
	console.log("   - Check 'Index Explorer'");
	console.log("   - View crawl stats\n");

	console.log("⏱️  Indexing Timeline:");
	console.log("   - IndexNow: URLs queued immediately (202 Accepted)");
	console.log("   - Bing: Usually crawls within 24-48 hours");
	console.log("   - Google: Can take 1-4 weeks for new sites");
	console.log("   - Yandex: Usually crawls within a few days\n");
}

async function main() {
	console.log("🚀 IndexNow Verification Tool");
	console.log(`Site: ${SITE_URL}`);
	console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

	const keyFileOk = await verifyKeyFile();
	const sitemapOk = await verifySitemap();

	console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

	if (keyFileOk && sitemapOk) {
		console.log("\n✅ All checks passed! Your site is ready for IndexNow submissions.");
		await checkIndexingStatus();
	} else {
		console.log("\n⚠️  Some checks failed. Fix the issues above before submitting.");
	}

	console.log("\n📝 Next Steps:");
	console.log("1. Run submission script:");
	console.log("   pnpm seo:submit:indexnow");
	console.log("\n2. Monitor indexing (wait 24-48 hours):");
	console.log("   - Check Google/Bing search with site: operator");
	console.log("   - Review Search Console reports");
	console.log("\n3. Resubmit when content changes:");
	console.log("   - After adding new jobs/resources");
	console.log("   - After updating existing pages");
}

main();
