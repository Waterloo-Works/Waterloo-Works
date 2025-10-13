import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
	const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://waterloo.works';

	return {
		rules: [
			{
				userAgent: '*',
				allow: '/',
				disallow: [
					'/api/',
					'/admin/',
					'/dashboard/',
					'/my-jobs/',
					'/inbox/',
					'/bookmarks/',
				],
			},
		],
		sitemap: `${baseUrl}/sitemap.xml`,
	};
}
