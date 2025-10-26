import { allCompanies } from "content-collections";
import Link from "next/link";
import { Metadata } from "next";
import { PageViewTracker } from "@/components/PageViewTracker";

export const dynamic = 'force-static';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://waterloo.works';

export const metadata: Metadata = {
	title: "Browse Top Companies | Waterloo.app - Hiring Canadian Students",
	description: "Discover 100+ tech companies hiring Canadian students from UWaterloo. Explore internships, co-op positions, and full-time roles at top startups and established companies.",
	openGraph: {
		title: "Browse Top Companies on Waterloo.app",
		description: "Discover companies hiring Canadian students. 100+ companies, 500+ open roles.",
		url: `${siteUrl}/companies`,
		siteName: 'waterloo.app',
		images: [
			{
				url: `${siteUrl}/api/og/companies`,
				width: 1200,
				height: 630,
				alt: 'Browse top companies hiring on waterloo.app',
			},
		],
		type: 'website',
	},
	twitter: {
		card: 'summary_large_image',
		title: "Browse Top Companies on Waterloo.app",
		description: "Discover companies hiring Canadian students. 100+ companies, 500+ open roles.",
		images: [`${siteUrl}/api/og/companies`],
	},
};

export default function CompaniesIndexPage() {
	// Sort by job count descending, then by latest job date
	const companies = (allCompanies || []).sort((a, b) => {
		if (b.jobCount !== a.jobCount) {
			return b.jobCount - a.jobCount;
		}
		return (
			new Date(b.latestJobDate).getTime() -
			new Date(a.latestJobDate).getTime()
		);
	});

	return (
		<div className="min-h-svh bg-white">
			<PageViewTracker pageType="companies_index" metadata={{ total_companies: companies.length }} />
			<div className="mx-auto max-w-4xl px-6 py-12">
				{/* Header */}
				<div className="mb-12">
					<h1 className="font-header text-4xl md:text-5xl font-semibold tracking-tight text-zinc-900 mb-4">
						Hiring Companies
					</h1>
					<p className="text-xl text-zinc-600">
						Explore companies actively hiring in our community
					</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					{companies.map((company) => {
						return (
							<Link
								key={company.slug}
								href={`/companies/${company.slug}`}
								className="block rounded-2xl border border-zinc-200 bg-white p-6 hover:shadow-md transition-shadow"
							>
								<div className="flex items-start gap-4">
									{company.companyImageUrl && (
										<img
											src={company.companyImageUrl}
											alt={`${company.name} logo`}
											className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
										/>
									)}
									<div className="flex-1 min-w-0">
										<h2 className="text-xl font-semibold text-zinc-900 truncate">
											{company.name}
										</h2>
										<p className="text-sm text-zinc-600 mt-2">
											{company.jobCount}{" "}
											{company.jobCount === 1
												? "open position"
												: "open positions"}
										</p>
										{company.companyUrl && (
											<p className="text-sm text-blue-600 hover:underline mt-1 truncate">
												{new URL(company.companyUrl).hostname}
											</p>
										)}
									</div>
								</div>
							</Link>
						);
					})}
				</div>

				{companies.length === 0 && (
					<p className="text-center text-zinc-500 py-12">
						No companies available at the moment.
					</p>
				)}
			</div>
		</div>
	);
}
