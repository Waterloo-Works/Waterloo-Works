import { allCompanies } from "content-collections";
import Link from "next/link";
import { Metadata } from "next";
import { PageViewTracker } from "@/components/PageViewTracker";

export const dynamic = 'force-static';

export const metadata: Metadata = {
	title: "All Companies | Waterloo Works",
	description: "Browse all hiring companies on Waterloo Works",
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
				<h1 className="font-title text-3xl md:text-4xl font-semibold tracking-tight text-zinc-900 mb-8">
					Hiring Companies
				</h1>

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
