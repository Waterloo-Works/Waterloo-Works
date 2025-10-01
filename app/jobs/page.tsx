import { getJobs } from "@/app/actions/jobs";
import Navbar from "@/components/Navbar";
import FaviconImage from "@/components/FaviconImage";
import ShareButton from "@/components/ShareButton";
import Link from "next/link";
import { formatEmploymentType } from "@/lib/formatEmploymentType";

export default async function JobsPage() {
	const jobs = await getJobs();

	return (
		<div className="min-h-screen bg-[#F5F1E8]">
			<Navbar />

			{/* Main Content */}
			<main className="max-w-6xl mx-auto px-6 py-12">
				{/* Header */}
				<div className="mb-12">
					<h1 className="text-4xl md:text-5xl lg:text-6xl font-serif italic text-black mb-4">
						Job Board
					</h1>
					<p className="text-lg md:text-xl text-gray-700">
						Browse opportunities shared by our community
					</p>
				</div>

				{/* Job Listings */}
				{jobs.length === 0 ? (
					<div className="text-center py-20">
						<div className="inline-block w-16 h-16 bg-gray-200 rounded-full mb-4"></div>
						<h3 className="text-xl font-serif mb-2">No jobs yet</h3>
						<p className="text-gray-600">
							Be the first to post an opportunity to the community!
						</p>
					</div>
				) : (
					<div className="space-y-4">
						{jobs.map(job => (
							<div
								key={job.id}
								className="bg-white/60 backdrop-blur-sm border border-black/10 rounded-lg p-6 hover:border-black/30 transition-colors"
							>
								<div className="space-y-4">
									{/* Position Title with Company Logo and Share */}
									<div className="flex items-start justify-between gap-4">
										<Link
											href={`/jobs/${job.id}`}
											className="flex items-start gap-3 flex-1 group"
										>
											<FaviconImage
												src={job.companyImageUrl}
												company={job.company}
											/>
											<h3 className="text-xl md:text-2xl font-serif font-semibold text-black group-hover:underline">
												{job.position}
											</h3>
										</Link>
										<ShareButton
											jobId={job.id}
											jobTitle={job.position}
										/>
									</div>

									{/* Job Details Grid */}
									<div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
										<div>
											<div className="text-sm text-gray-500 mb-1">
												Company
											</div>
											{job.companyUrl ? (
												<a
													href={job.companyUrl}
													target="_blank"
													rel="noopener noreferrer"
													className="text-black hover:underline flex items-center gap-1"
												>
													{job.company}
													<span className="text-xs">↗</span>
												</a>
											) : (
												<div className="text-black">
													{job.company}
												</div>
											)}
										</div>

										<div>
											<div className="text-sm text-gray-500 mb-1">
												Contact Name
											</div>
											{job.contactUrl ? (
												<a
													href={job.contactUrl}
													target="_blank"
													rel="noopener noreferrer"
													className="text-black hover:underline flex items-center gap-1"
												>
													{job.contact}
													<span className="text-xs">↗</span>
												</a>
											) : (
												<div className="text-black">
													{job.contact}
												</div>
											)}
										</div>

										<div>
											<div className="text-sm text-gray-500 mb-1">
												Location
											</div>
											<div className="text-black">
												{job.location}
											</div>
										</div>

										<div>
											<div className="text-sm text-gray-500 mb-1">
												Employment Type
											</div>
											<div className="text-black">
												{formatEmploymentType(job.employmentType)}
											</div>
										</div>

										{(job.salaryMin || job.salaryMax) && (
											<div>
												<div className="text-sm text-gray-500 mb-1">
													Salary Range
												</div>
												<div className="text-black">
													{job.salaryMin && job.salaryMax
														? `${job.salaryMin} - ${job.salaryMax}`
														: job.salaryMin
														? `${job.salaryMin}+`
														: job.salaryMax
														? `Up to ${job.salaryMax}`
														: null}
												</div>
											</div>
										)}
									</div>

									{/* Notes */}
									{job.notes && (
										<div>
											<div className="text-sm text-gray-500 mb-1">
												Notes
											</div>
											<p className="text-gray-700 whitespace-pre-wrap">
												{job.notes}
											</p>
										</div>
									)}

									{/* Footer */}
									<div className="pt-4 border-t border-black/10 flex items-center justify-between text-xs text-gray-500">
										<div className="flex items-center gap-4">
											<span>
												Posted{" "}
												{new Date(
													job.createdAt
												).toLocaleDateString()}
											</span>
											{job.poster && (
												<span>
													by{" "}
													{job.poster.fullName ||
														job.poster.email.split("@")[0]}
												</span>
											)}
										</div>
									</div>
								</div>
							</div>
						))}
					</div>
				)}
			</main>
		</div>
	);
}
