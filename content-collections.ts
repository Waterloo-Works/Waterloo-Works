import { defineCollection, defineConfig } from "@content-collections/core";
import { compileMarkdown } from "@content-collections/markdown";

const jobs = defineCollection({
	name: "jobs",
	directory: "content/jobs",
	include: "**/*.md",
	schema: (z) => ({
		slug: z.string(),
		title: z.string(),
		company: z.string(),
		companyUrl: z.string().nullable(),
		companyImageUrl: z.string().nullable(),
		location: z.string(),
		employmentType: z.enum([
			"FULL_TIME",
			"PART_TIME",
			"CONTRACT",
			"INTERNSHIP",
			"OTHER",
		]),
		salaryMin: z.string().nullable(),
		salaryMax: z.string().nullable(),
		contact: z.string(),
		contactUrl: z.string().nullable(),
		postedAt: z.string(),
		updatedAt: z.string(),
	}),
	transform: async (document, context) => {
		const html = await compileMarkdown(context, document);
		return {
			...document,
			html,
		};
	},
});

const companies = defineCollection({
	name: "companies",
	directory: "content/companies",
	include: "**/*.md",
	schema: (z) => ({
		name: z.string(),
		slug: z.string(),
		companyUrl: z.string().nullable(),
		companyImageUrl: z.string().nullable(),
		jobCount: z.number(),
		latestJobDate: z.string(),
	}),
	transform: async (document, context) => {
		const html = await compileMarkdown(context, document);
		return {
			...document,
			html,
		};
	},
});

const blogs = defineCollection({
	name: "blogs",
	directory: "content/blogs",
	include: "**/*.md",
	schema: (z) => ({
		slug: z.string(),
		title: z.string(),
		excerpt: z.string().nullable(),
		author: z.string().nullable(),
		tags: z.array(z.string()),
		coverImage: z.string().nullable(),
		publishedAt: z.string(),
		updatedAt: z.string(),
	}),
	transform: async (document, context) => {
		const html = await compileMarkdown(context, document);
		return {
			...document,
			html,
		};
	},
});

export default defineConfig({
	collections: [jobs, companies, blogs],
});
