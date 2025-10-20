import { allJobs } from "content-collections";
import Link from "next/link";
import { Metadata } from "next";
import { PageViewTracker } from "@/components/PageViewTracker";

export const dynamic = 'force-static';

export const metadata: Metadata = {
	title: "All Jobs | Waterloo App",
	description: "Browse all available job opportunities on Waterloo App",
};

export default function JobsIndexPage() {
	// Sort by most recent first
	const jobs = (allJobs || []).sort(
		(a, b) =>
			new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime()
	);

	return (
		<div className="min-h-svh bg-white">
			<PageViewTracker pageType="jobs_index" metadata={{ total_jobs: jobs.length }} />
			<div className="mx-auto max-w-4xl px-6 py-12">
				{/* Header */}
				<div className="mb-12">
					<h1 className="font-header text-4xl md:text-5xl font-semibold tracking-tight text-zinc-900 mb-4">
						All Job Listings
					</h1>
					<p className="text-xl text-zinc-600">
						Browse all available opportunities from our community
					</p>
				</div>

				<div className="space-y-6">
					{jobs.map((job) => {
						return (
							<Link
								key={job.slug}
								href={`/jobs/${job.slug}`}
								className="block rounded-2xl border border-zinc-200 bg-white p-6 hover:shadow-md transition-shadow"
							>
								<div className="flex items-start justify-between gap-4">
									<div className="flex-1">
										<h2 className="text-xl font-semibold text-zinc-900">
											{job.title}
										</h2>
										<p className="text-zinc-600 mt-1">{job.company}</p>
										<div className="mt-3 flex flex-wrap gap-3 text-sm text-zinc-500">
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
									</div>
									{job.companyImageUrl && (
										<img
											src={job.companyImageUrl}
											alt={`${job.company} logo`}
											className="w-12 h-12 rounded-lg object-cover"
										/>
									)}
								</div>
							</Link>
						);
					})}
				</div>

				{jobs.length === 0 && (
					<p className="text-center text-zinc-500 py-12">
						No jobs available at the moment.
					</p>
				)}
			</div>
		</div>
	);
}
