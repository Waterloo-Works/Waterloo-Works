import { allCompanies, allJobs } from "content-collections";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import { PageViewTracker } from "@/components/PageViewTracker";

export const dynamic = 'force-static';

export async function generateStaticParams() {
	return (allCompanies || []).map((company) => ({
		slug: company.slug,
	}));
}

export async function generateMetadata({
	params,
}: {
	params: Promise<{ slug: string }>;
}): Promise<Metadata> {
	const { slug } = await params;
	const company = (allCompanies || []).find((c) => c.slug === slug);

	if (!company) {
		return {
			title: "Company Not Found | Waterloo Works",
		};
	}

	return {
		title: `${company.name} Jobs | Waterloo Works`,
		description: `View ${company.jobCount} open positions at ${company.name}`,
	};
}

export default async function CompanyPage({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const { slug } = await params;
	const company = (allCompanies || []).find((c) => c.slug === slug);

	if (!company) {
		notFound();
	}

	// Find all jobs for this company for internal linking
	const companyJobs = (allJobs || []).filter(
		(job) => job.company.toLowerCase() === company.name.toLowerCase()
	);

	return (
		<div className="min-h-svh bg-white">
			<PageViewTracker
				pageType="company"
				metadata={{
					company_name: company.name,
					job_count: company.jobCount,
				}}
			/>
			<div className="mx-auto max-w-3xl px-6 py-12">
				{/* Breadcrumbs for SEO and navigation */}
				<nav className="mb-8 text-sm text-zinc-600" aria-label="Breadcrumb">
					<ol className="flex items-center space-x-2">
						<li>
							<Link href="/" className="hover:text-zinc-900">
								Home
							</Link>
						</li>
						<li>/</li>
						<li>
							<Link href="/companies" className="hover:text-zinc-900">
								Companies
							</Link>
						</li>
						<li>/</li>
						<li className="text-zinc-900 font-medium">{company.name}</li>
					</ol>
				</nav>

				{/* Back link */}
				<Link
					href="/companies"
					className="inline-flex items-center text-zinc-600 hover:text-zinc-900 mb-8"
				>
					← Back to all companies
				</Link>

				{/* Company header */}
				<div className="mb-8">
					<div className="flex items-start gap-4 mb-4">
						{company.companyImageUrl && (
							<img
								src={company.companyImageUrl}
								alt={`${company.name} logo`}
								className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
							/>
						)}
						<div className="flex-1">
							<h1 className="font-title text-3xl md:text-4xl font-semibold tracking-tight text-zinc-900">
								{company.name}
							</h1>
							<p className="text-zinc-600 mt-2">
								{company.jobCount}{" "}
								{company.jobCount === 1
									? "open position"
									: "open positions"}
							</p>
							{company.companyUrl && (
								<a
									href={company.companyUrl}
									target="_blank"
									rel="noopener noreferrer"
									className="inline-flex items-center text-blue-600 hover:underline mt-2"
								>
									Visit company website →
								</a>
							)}
						</div>
					</div>
				</div>

				{/* Company content (rendered HTML from markdown) */}
				<article
					className="prose prose-zinc max-w-none"
					dangerouslySetInnerHTML={{ __html: company.html }}
				/>

				{/* Job listings for this company - Important for internal linking and pSEO */}
				{companyJobs.length > 0 && (
					<div className="mt-12 pt-8 border-t border-zinc-200">
						<h2 className="font-title text-2xl font-semibold text-zinc-900 mb-6">
							Current Openings
						</h2>
						<div className="space-y-4">
							{companyJobs.map((job) => (
								<Link
									key={job.slug}
									href={`/jobs/${job.slug}`}
									className="block rounded-xl border border-zinc-200 bg-white p-4 hover:shadow-md transition-shadow"
								>
									<h3 className="text-lg font-semibold text-zinc-900">
										{job.title}
									</h3>
									<div className="mt-2 flex flex-wrap gap-3 text-sm text-zinc-500">
										<span>📍 {job.location}</span>
										<span>•</span>
										<span>
											{job.employmentType
												.replace(/_/g, " ")
												.split(" ")
												.map(
													(word) =>
														word.charAt(0).toUpperCase() +
														word.slice(1).toLowerCase()
												)
												.join(" ")}
										</span>
										{(job.salaryMin || job.salaryMax) && (
											<>
												<span>•</span>
												<span>
													{job.salaryMin && job.salaryMax
														? `$${job.salaryMin} - $${job.salaryMax}`
														: job.salaryMin
															? `From $${job.salaryMin}`
															: `Up to $${job.salaryMax}`}
												</span>
											</>
										)}
									</div>
								</Link>
							))}
						</div>
					</div>
				)}

				{/* Call to action */}
				<div className="mt-12 pt-8 border-t border-zinc-200">
					<Link
						href="/jobs"
						className="inline-flex items-center justify-center rounded-full bg-zinc-900 px-8 py-3 text-white hover:bg-zinc-800 transition-colors"
					>
						View all job listings
					</Link>
				</div>
			</div>
		</div>
	);
}
