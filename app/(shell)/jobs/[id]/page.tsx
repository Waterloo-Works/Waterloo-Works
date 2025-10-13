import { allJobs } from "content-collections";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";

export const dynamic = 'force-static';

export async function generateStaticParams() {
	return allJobs.map((job) => ({
		id: job.slug,
	}));
}

export async function generateMetadata({
	params,
}: {
	params: Promise<{ id: string }>;
}): Promise<Metadata> {
	const { id } = await params;
	const job = allJobs.find((j) => j.slug === id);

	if (!job) {
		return {
			title: "Job Not Found | Waterloo Works",
		};
	}

	return {
		title: `${job.title} at ${job.company} | Waterloo Works`,
		description: `${job.title} position at ${job.company} in ${job.location}`,
	};
}

export default async function JobPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	const job = allJobs.find((j) => j.slug === id);

	if (!job) {
		notFound();
	}

	// Find related jobs (same company or location) for internal linking
	const relatedJobs = allJobs
		.filter(
			(j) =>
				j.slug !== job.slug &&
				(j.company.toLowerCase() === job.company.toLowerCase() ||
					j.location.toLowerCase() === job.location.toLowerCase())
		)
		.slice(0, 3);

	return (
		<div className="min-h-svh bg-white">
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
							<Link href="/jobs" className="hover:text-zinc-900">
								Jobs
							</Link>
						</li>
						<li>/</li>
						<li className="text-zinc-900 font-medium">{job.title}</li>
					</ol>
				</nav>

				{/* Back link */}
				<Link
					href="/jobs"
					className="inline-flex items-center text-zinc-600 hover:text-zinc-900 mb-8"
				>
					← Back to all jobs
				</Link>

				{/* Job header */}
				<div className="mb-8">
					<div className="flex items-start justify-between gap-4 mb-4">
						<div className="flex-1">
							<h1 className="font-title text-3xl md:text-4xl font-semibold tracking-tight text-zinc-900">
								{job.title}
							</h1>
							<p className="text-xl text-zinc-600 mt-2">{job.company}</p>
						</div>
						{job.companyImageUrl && (
							<img
								src={job.companyImageUrl}
								alt={`${job.company} logo`}
								className="w-16 h-16 rounded-lg object-cover"
							/>
						)}
					</div>

					{/* Job details */}
					<div className="flex flex-wrap gap-4 text-sm text-zinc-500">
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

					{/* Company link */}
					{job.companyUrl && (
						<a
							href={job.companyUrl}
							target="_blank"
							rel="noopener noreferrer"
							className="inline-flex items-center text-blue-600 hover:underline mt-4"
						>
							Visit company website →
						</a>
					)}
				</div>

				{/* Job content (rendered HTML from markdown) */}
				<article
					className="prose prose-zinc max-w-none"
					dangerouslySetInnerHTML={{ __html: job.html }}
				/>

				{/* Related jobs for internal linking and pSEO */}
				{relatedJobs.length > 0 && (
					<div className="mt-12 pt-8 border-t border-zinc-200">
						<h2 className="font-title text-2xl font-semibold text-zinc-900 mb-6">
							Related Opportunities
						</h2>
						<div className="space-y-4">
							{relatedJobs.map((relatedJob) => (
								<Link
									key={relatedJob.slug}
									href={`/jobs/${relatedJob.slug}`}
									className="block rounded-xl border border-zinc-200 bg-white p-4 hover:shadow-md transition-shadow"
								>
									<h3 className="text-lg font-semibold text-zinc-900">
										{relatedJob.title}
									</h3>
									<p className="text-zinc-600 mt-1">{relatedJob.company}</p>
									<div className="mt-2 flex flex-wrap gap-3 text-sm text-zinc-500">
										<span>📍 {relatedJob.location}</span>
										<span>•</span>
										<span>
											{relatedJob.employmentType
												.replace(/_/g, " ")
												.split(" ")
												.map(
													(word) =>
														word.charAt(0).toUpperCase() +
														word.slice(1).toLowerCase()
												)
												.join(" ")}
										</span>
									</div>
								</Link>
							))}
						</div>
					</div>
				)}

				{/* Apply button */}
				{job.contactUrl && (
					<div className="mt-12 pt-8 border-t border-zinc-200">
						<a
							href={job.contactUrl}
							target="_blank"
							rel="noopener noreferrer"
							className="inline-flex items-center justify-center rounded-full bg-zinc-900 px-8 py-3 text-white hover:bg-zinc-800 transition-colors"
						>
							Apply for this position
						</a>
					</div>
				)}
			</div>
		</div>
	);
}
