import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
	const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://waterloo.app';

	return {
		rules: [
			{
				userAgent: '*',
				allow: '/',
				disallow: [
					'/api/',
					'/admin/',
					'/my-jobs/',
					'/inbox/',
					'/bookmarks/',
				],
			},
		],
		sitemap: `${baseUrl}/sitemap.xml`,
	};
}
