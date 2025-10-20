import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const INDEXNOW_KEY = "c2625de7b6514de28e9ed33e320098e9";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://waterloo.app";

function slugify(text: string): string {
	return text
		.toLowerCase()
		.replace(/[^\w\s-]/g, "")
		.replace(/[\s_-]+/g, "-")
		.replace(/^-+|-+$/g, "");
}

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

	console.log("Request body:");
	console.log(`  Host: ${body.host}`);
	console.log(`  Key: ${body.key}`);
	console.log(`  Key Location: ${body.keyLocation}`);
	console.log(`  URLs Count: ${body.urlList.length}`);
	console.log("\nFirst 5 URLs being submitted:");
	urls.slice(0, 5).forEach((url, i) => console.log(`  ${i + 1}. ${url}`));
	if (urls.length > 5) {
		console.log(`  ... and ${urls.length - 5} more\n`);
	}

	try {
		const response = await fetch(endpoint, {
			method: "POST",
			headers: {
				"Content-Type": "application/json; charset=utf-8",
			},
			body: JSON.stringify(body),
		});

		console.log(`\nResponse Status: ${response.status} ${response.statusText}`);

		if (response.ok || response.status === 202) {
			console.log("✅ Successfully submitted URLs to IndexNow");

			// 200 OK = URLs received and will be processed
			// 202 Accepted = URLs received and queued for processing (most common)
			if (response.status === 202) {
				console.log("   Status 202 means URLs were accepted and queued for crawling");
			}

			return true;
		} else {
			const text = await response.text();
			console.error("❌ Failed to submit URLs");
			console.error(`Response: ${text}`);

			// Common error codes
			if (response.status === 400) {
				console.error("   Error 400: Bad Request - Check URL format and key location");
			} else if (response.status === 403) {
				console.error("   Error 403: Forbidden - Verify key file is accessible");
			} else if (response.status === 422) {
				console.error("   Error 422: Unprocessable - Invalid URL format or host mismatch");
			}

			return false;
		}
	} catch (error) {
		console.error("❌ Error submitting to IndexNow:", error);
		return false;
	}
}

async function getAllUrls(): Promise<string[]> {
	console.log("📄 Collecting URLs from database...\n");

	const urls: string[] = [];

	// 1. Static routes
	const staticRoutes = [
		"/",
		"/jobs",
		"/companies",
		"/blog",
		"/resources",
		"/explore",
		"/post-job",
		"/login",
		"/signup",
	];
	urls.push(...staticRoutes.map((route) => `${SITE_URL}${route}`));

	// 2. Job pages (approved jobs only)
	const jobs = await prisma.job.findMany({
		where: { status: "APPROVED" },
		select: { position: true, company: true, location: true },
	});
	const jobUrls = jobs.map((job) => {
		const slug = slugify(`${job.position}-${job.company}-${job.location}`);
		return `${SITE_URL}/jobs/${slug}`;
	});
	urls.push(...jobUrls);
	console.log(`✅ Found ${jobs.length} job pages`);

	// 3. Company pages (unique companies)
	const companies = await prisma.job.findMany({
		where: { status: "APPROVED" },
		distinct: ["company"],
		select: { company: true },
	});
	const companyUrls = companies.map((c) => {
		const slug = c.company
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, "-")
			.replace(/^-|-$/g, "");
		return `${SITE_URL}/companies/${slug}`;
	});
	urls.push(...companyUrls);
	console.log(`✅ Found ${companies.length} company pages`);

	// 4. Blog pages (published only)
	const blogs = await prisma.blog.findMany({
		where: { published: true },
		select: { slug: true },
	});
	urls.push(...blogs.map((blog) => `${SITE_URL}/blog/${blog.slug}`));
	console.log(`✅ Found ${blogs.length} blog pages`);

	// 5. Resource pages (published only)
	const resources = await prisma.resource.findMany({
		where: { published: true },
		select: { slug: true },
	});
	urls.push(...resources.map((resource) => `${SITE_URL}/resources/${resource.slug}`));
	console.log(`✅ Found ${resources.length} resource pages`);

	console.log(`\n✅ Total URLs collected: ${urls.length}\n`);

	return urls;
}

async function main() {
	console.log("🚀 IndexNow URL Submission Script (Database Source)");
	console.log(`Site: ${SITE_URL}`);
	console.log(`Key: ${INDEXNOW_KEY}`);
	console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

	try {
		// Get URLs directly from database
		const urls = await getAllUrls();

		if (urls.length === 0) {
			console.log("⚠️  No URLs found in database");
			return;
		}

		// IndexNow has a limit of 10,000 URLs per request
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
	} finally {
		await prisma.$disconnect();
	}
}

main();
