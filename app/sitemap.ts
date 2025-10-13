import { MetadataRoute } from 'next';
import { allJobs, allCompanies, allBlogs, allResources } from 'content-collections';

export default function sitemap(): MetadataRoute.Sitemap {
	const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://waterloo.works';

	// Static routes
	const staticRoutes = [
		{
			url: baseUrl,
			lastModified: new Date(),
			changeFrequency: 'daily' as const,
			priority: 1,
		},
		{
			url: `${baseUrl}/jobs`,
			lastModified: new Date(),
			changeFrequency: 'hourly' as const,
			priority: 0.9,
		},
		{
			url: `${baseUrl}/companies`,
			lastModified: new Date(),
			changeFrequency: 'daily' as const,
			priority: 0.8,
		},
		{
			url: `${baseUrl}/blog`,
			lastModified: new Date(),
			changeFrequency: 'weekly' as const,
			priority: 0.7,
		},
		{
			url: `${baseUrl}/resources`,
			lastModified: new Date(),
			changeFrequency: 'weekly' as const,
			priority: 0.8,
		},
		{
			url: `${baseUrl}/explore`,
			lastModified: new Date(),
			changeFrequency: 'daily' as const,
			priority: 0.6,
		},
		{
			url: `${baseUrl}/post-job`,
			lastModified: new Date(),
			changeFrequency: 'monthly' as const,
			priority: 0.5,
		},
	];

	// Job pages
	const jobPages = allJobs.map((job) => ({
		url: `${baseUrl}/jobs/${job.slug}`,
		lastModified: new Date(job.updatedAt),
		changeFrequency: 'daily' as const,
		priority: 0.8,
	}));

	// Company pages
	const companyPages = allCompanies.map((company) => ({
		url: `${baseUrl}/companies/${company.slug}`,
		lastModified: new Date(company.latestJobDate),
		changeFrequency: 'daily' as const,
		priority: 0.7,
	}));

	// Blog pages
	const blogPages = allBlogs.map((blog) => ({
		url: `${baseUrl}/blog/${blog.slug}`,
		lastModified: new Date(blog.updatedAt),
		changeFrequency: 'monthly' as const,
		priority: 0.6,
	}));

	// Resource pages
	const resourcePages = allResources.map((resource) => ({
		url: `${baseUrl}/resources/${resource.slug}`,
		lastModified: new Date(resource.updatedAt),
		changeFrequency: 'monthly' as const,
		priority: 0.7,
	}));

	return [
		...staticRoutes,
		...jobPages,
		...companyPages,
		...blogPages,
		...resourcePages,
	];
}
