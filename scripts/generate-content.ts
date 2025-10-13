import { PrismaClient } from "@prisma/client";
import fs from "fs/promises";
import path from "path";

const prisma = new PrismaClient();

function slugify(text: string): string {
	return text
		.toLowerCase()
		.replace(/[^\w\s-]/g, "")
		.replace(/[\s_-]+/g, "-")
		.replace(/^-+|-+$/g, "");
}

function formatSalary(min?: string | null, max?: string | null): string {
	if (!min && !max) return "Not specified";
	if (min && max) return `$${min} - $${max}`;
	if (min) return `From $${min}`;
	if (max) return `Up to $${max}`;
	return "Not specified";
}

function formatEmploymentType(type: string): string {
	const map: Record<string, string> = {
		FULL_TIME: "Full-time",
		PART_TIME: "Part-time",
		CONTRACT: "Contract",
		INTERNSHIP: "Internship",
		OTHER: "Other",
	};
	return map[type] || type;
}

async function generateJobMarkdown() {
	console.log("📝 Generating job markdown files...");

	const jobs = await prisma.job.findMany({
		where: { status: "APPROVED" },
		orderBy: { createdAt: "desc" },
	});

	const jobsDir = path.join(process.cwd(), "content/jobs");
	await fs.mkdir(jobsDir, { recursive: true });

	for (const job of jobs) {
		// Create SEO-friendly slug: position-company-location
		const slug = slugify(
			`${job.position}-${job.company}-${job.location}`
		);

		const content = `---
slug: "${slug}"
title: "${job.position}"
company: "${job.company}"
companyUrl: ${job.companyUrl ? `"${job.companyUrl}"` : "null"}
companyImageUrl: ${job.companyImageUrl ? `"${job.companyImageUrl}"` : "null"}
location: "${job.location}"
employmentType: "${job.employmentType}"
salaryMin: ${job.salaryMin ? `"${job.salaryMin}"` : "null"}
salaryMax: ${job.salaryMax ? `"${job.salaryMax}"` : "null"}
contact: "${job.contact}"
contactUrl: ${job.contactUrl ? `"${job.contactUrl}"` : "null"}
postedAt: "${job.createdAt.toISOString()}"
updatedAt: "${job.updatedAt.toISOString()}"
---

# ${job.position} at ${job.company}

**Location:** ${job.location}
**Employment Type:** ${formatEmploymentType(job.employmentType)}
**Salary:** ${formatSalary(job.salaryMin, job.salaryMax)}

## About the Role

${job.notes || "No additional details provided."}

## Contact

**${job.contact}**${job.contactUrl ? `  \n**Apply:** [${job.contactUrl}](${job.contactUrl})` : ""}
`;

		const filename = `${slug}.md`;
		await fs.writeFile(path.join(jobsDir, filename), content, "utf-8");
	}

	console.log(`✅ Generated ${jobs.length} job markdown files`);
	return jobs;
}

async function generateCompanyMarkdown(jobs: any[]) {
	console.log("🏢 Generating company markdown files...");

	// Group jobs by company
	const companiesMap = new Map<string, any[]>();
	for (const job of jobs) {
		const companyKey = job.company.toLowerCase();
		if (!companiesMap.has(companyKey)) {
			companiesMap.set(companyKey, []);
		}
		companiesMap.get(companyKey)!.push(job);
	}

	const companiesDir = path.join(process.cwd(), "content/companies");
	await fs.mkdir(companiesDir, { recursive: true });

	for (const [companyKey, companyJobs] of companiesMap.entries()) {
		const company = companyJobs[0]; // Use first job for company info
		const slug = slugify(company.company);
		const jobCount = companyJobs.length;
		const latestJob = companyJobs[0]; // Already sorted by createdAt desc

		const jobsList = companyJobs
			.map(
				(job) =>
					`- **${job.position}** (${job.location}) - ${formatEmploymentType(job.employmentType)}`
			)
			.join("\n");

		const content = `---
name: "${company.company}"
slug: "${slug}"
companyUrl: ${company.companyUrl ? `"${company.companyUrl}"` : "null"}
companyImageUrl: ${company.companyImageUrl ? `"${company.companyImageUrl}"` : "null"}
jobCount: ${jobCount}
latestJobDate: "${latestJob.createdAt.toISOString()}"
---

# ${company.company}

**Website:** ${company.companyUrl ? `[${company.companyUrl}](${company.companyUrl})` : "Not available"}
**Active Openings:** ${jobCount}

## Current Openings

${jobsList}

---

*Last updated: ${new Date().toLocaleDateString()}*
`;

		const filename = `${slug}.md`;
		await fs.writeFile(path.join(companiesDir, filename), content, "utf-8");
	}

	console.log(`✅ Generated ${companiesMap.size} company markdown files`);
}

async function main() {
	try {
		console.log("🚀 Starting content generation from database...\n");

		// Generate job markdown files
		const jobs = await generateJobMarkdown();

		// Generate company markdown files
		await generateCompanyMarkdown(jobs);

		console.log("\n✨ Content generation completed successfully!");
	} catch (error) {
		console.error("❌ Error generating content:", error);
		process.exit(1);
	} finally {
		await prisma.$disconnect();
	}
}

main();
