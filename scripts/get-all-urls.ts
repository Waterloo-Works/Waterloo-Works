import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://waterloo.works";

interface URLGroup {
	name: string;
	urls: string[];
}

function slugify(text: string): string {
	return text
		.toLowerCase()
		.replace(/[^\w\s-]/g, "")
		.replace(/[\s_-]+/g, "-")
		.replace(/^-+|-+$/g, "");
}

async function getAllUrls(): Promise<URLGroup[]> {
	console.log("🔍 Collecting all URLs from database...\n");

	const groups: URLGroup[] = [];

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

	groups.push({
		name: "Static Routes",
		urls: staticRoutes.map((route) => `${SITE_URL}${route}`),
	});

	// 2. Job pages (from database - approved jobs only)
	const jobs = await prisma.job.findMany({
		where: { status: "APPROVED" },
		select: { position: true, company: true, location: true },
	});

	const jobUrls = jobs.map((job) => {
		const slug = slugify(`${job.position}-${job.company}-${job.location}`);
		return `${SITE_URL}/jobs/${slug}`;
	});

	groups.push({
		name: "Job Pages",
		urls: jobUrls,
	});

	// 3. Company pages (unique companies from approved jobs)
	const companies = await prisma.job.findMany({
		where: { status: "APPROVED" },
		distinct: ["company"],
		select: { company: true },
	});

	const companyUrls = companies.map((c) => {
		// Create slug from company name
		const slug = c.company
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, "-")
			.replace(/^-|-$/g, "");
		return `${SITE_URL}/companies/${slug}`;
	});

	groups.push({
		name: "Company Pages",
		urls: companyUrls,
	});

	// 4. Blog pages (published blogs only)
	const blogs = await prisma.blog.findMany({
		where: { published: true },
		select: { slug: true },
	});

	groups.push({
		name: "Blog Pages",
		urls: blogs.map((blog) => `${SITE_URL}/blog/${blog.slug}`),
	});

	// 5. Resource pages (published resources only)
	const resources = await prisma.resource.findMany({
		where: { published: true },
		select: { slug: true },
	});

	groups.push({
		name: "Resource Pages",
		urls: resources.map((resource) => `${SITE_URL}/resources/${resource.slug}`),
	});

	return groups;
}

async function printAllUrls() {
	console.log("🚀 URL Collection Script");
	console.log(`Site: ${SITE_URL}`);
	console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

	try {
		const groups = await getAllUrls();

		let totalCount = 0;

		for (const group of groups) {
			console.log(`\n📂 ${group.name} (${group.urls.length} URLs)`);
			console.log("─".repeat(50));

			if (group.urls.length > 0) {
				// Show first 10 URLs
				const preview = group.urls.slice(0, 10);
				preview.forEach((url, i) => {
					console.log(`   ${i + 1}. ${url}`);
				});

				if (group.urls.length > 10) {
					console.log(`   ... and ${group.urls.length - 10} more`);
				}
			} else {
				console.log("   (No URLs in this group)");
			}

			totalCount += group.urls.length;
		}

		console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
		console.log(`\n📊 Total: ${totalCount} URLs across ${groups.length} groups\n`);

		return groups;
	} catch (error) {
		console.error("❌ Error collecting URLs:", error);
		throw error;
	} finally {
		await prisma.$disconnect();
	}
}

async function exportToFile() {
	console.log("💾 Exporting URLs to file...\n");

	try {
		const groups = await getAllUrls();

		// Flatten all URLs
		const allUrls = groups.flatMap((g) => g.urls);

		// Create output content
		const output = {
			metadata: {
				site: SITE_URL,
				totalUrls: allUrls.length,
				generatedAt: new Date().toISOString(),
			},
			groups: groups.map((g) => ({
				name: g.name,
				count: g.urls.length,
				urls: g.urls,
			})),
			allUrls: allUrls,
		};

		// Write to file
		const fs = await import("fs/promises");
		const path = await import("path");
		const outputPath = path.join(process.cwd(), "all-urls.json");

		await fs.writeFile(outputPath, JSON.stringify(output, null, 2));

		console.log(`✅ Exported ${allUrls.length} URLs to: ${outputPath}`);
		console.log("\nYou can use this file for:");
		console.log("  - IndexNow bulk submissions");
		console.log("  - Sitemap generation");
		console.log("  - Link checking");
		console.log("  - SEO audits");

		return outputPath;
	} catch (error) {
		console.error("❌ Error exporting to file:", error);
		throw error;
	} finally {
		await prisma.$disconnect();
	}
}

async function printIndexNowFormat() {
	console.log("📋 IndexNow Format\n");

	try {
		const groups = await getAllUrls();
		const allUrls = groups.flatMap((g) => g.urls);

		console.log("Copy this array for IndexNow submission:\n");
		console.log(JSON.stringify(allUrls, null, 2));

		return allUrls;
	} catch (error) {
		console.error("❌ Error formatting for IndexNow:", error);
		throw error;
	} finally {
		await prisma.$disconnect();
	}
}

async function printRawUrls() {
	try {
		// Suppress the "Collecting URLs from database..." messages by calling a silent version
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

		// 4. Blog pages (published only)
		const blogs = await prisma.blog.findMany({
			where: { published: true },
			select: { slug: true },
		});
		urls.push(...blogs.map((blog) => `${SITE_URL}/blog/${blog.slug}`));

		// 6. Resource pages (published only)
		const resources = await prisma.resource.findMany({
			where: { published: true },
			select: { slug: true },
		});
		urls.push(...resources.map((resource) => `${SITE_URL}/resources/${resource.slug}`));

		// Just print URLs, one per line, no formatting
		urls.forEach((url) => console.log(url));

		return urls;
	} catch (error) {
		console.error("❌ Error printing raw URLs:", error);
		throw error;
	} finally {
		await prisma.$disconnect();
	}
}

async function main() {
	const args = process.argv.slice(2);
	const command = args[0] || "print";

	switch (command) {
		case "print":
			await printAllUrls();
			break;
		case "raw":
			await printRawUrls();
			break;
		case "export":
			await exportToFile();
			break;
		case "indexnow":
			await printIndexNowFormat();
			break;
		default:
			console.log("Usage:");
			console.log("  pnpm tsx scripts/get-all-urls.ts print      # Print all URLs grouped");
			console.log("  pnpm tsx scripts/get-all-urls.ts raw        # Print raw URLs (one per line)");
			console.log("  pnpm tsx scripts/get-all-urls.ts export     # Export to all-urls.json");
			console.log("  pnpm tsx scripts/get-all-urls.ts indexnow   # Format for IndexNow");
	}
}

main();
