import { prisma } from "@/utils/prisma";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import FaviconImage from "@/components/FaviconImage";
import ShareButton from "@/components/ShareButton";
import Link from "next/link";
import { getFaviconUrl } from "@/lib/favicon";
import { formatEmploymentType } from "@/lib/formatEmploymentType";

export default async function JobPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	const job = await prisma.job.findUnique({
		where: {
			id: id,
			status: "APPROVED", // Only show approved jobs
		},
		include: {
			poster: {
				select: {
					id: true,
					fullName: true,
					email: true,
				},
			},
		},
	});

	if (!job) {
		notFound();
	}

	// Retroactively fetch favicon if missing
	if (!job.companyImageUrl && job.companyUrl) {
		const faviconUrl = await getFaviconUrl(job.companyUrl);
		if (faviconUrl) {
			await prisma.job.update({
				where: { id: job.id },
				data: { companyImageUrl: faviconUrl },
			});
			job.companyImageUrl = faviconUrl;
		}
	}

	return (
		<div className="min-h-screen bg-[#F5F1E8]">
			<Navbar />

			{/* Main Content */}
			<main className="max-w-4xl mx-auto px-6 py-12">
				{/* Back Link */}
				<Link
					href="/jobs"
					className="inline-flex items-center gap-2 text-gray-700 hover:text-black transition-colors mb-8"
				>
					<span>←</span> Back to all jobs
				</Link>

				{/* Job Card */}
				<div className="bg-white/60 backdrop-blur-sm border border-black/10 rounded-lg p-8">
					<div className="space-y-6">
						{/* Header with Logo and Share */}
						<div className="flex items-start justify-between gap-4">
							<div className="flex items-start gap-4 flex-1">
								<FaviconImage
									src={job.companyImageUrl}
									company={job.company}
								/>
								<div>
									<h1 className="text-3xl md:text-4xl font-serif font-semibold text-black mb-2">
										{job.position}
									</h1>
									<div className="text-xl text-gray-700">
										{job.company}
									</div>
								</div>
							</div>
							<ShareButton jobId={job.id} jobTitle={job.position} />
						</div>

						{/* Job Details Grid */}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 pt-6 border-t border-black/10">
							<div>
								<div className="text-sm text-gray-500 mb-1">Company</div>
								{job.companyUrl ? (
									<a
										href={job.companyUrl}
										target="_blank"
										rel="noopener noreferrer"
										className="text-black hover:underline flex items-center gap-1 text-lg"
									>
										{job.company}
										<span className="text-xs">↗</span>
									</a>
								) : (
									<div className="text-black text-lg">
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
										className="text-black hover:underline flex items-center gap-1 text-lg"
									>
										{job.contact}
										<span className="text-xs">↗</span>
									</a>
								) : (
									<div className="text-black text-lg">
										{job.contact}
									</div>
								)}
							</div>

							<div>
								<div className="text-sm text-gray-500 mb-1">Location</div>
								<div className="text-black text-lg">{job.location}</div>
							</div>

							<div>
								<div className="text-sm text-gray-500 mb-1">
									Employment Type
								</div>
								<div className="text-black text-lg">
									{formatEmploymentType(job.employmentType)}
								</div>
							</div>

							{(job.salaryMin || job.salaryMax) && (
								<div>
									<div className="text-sm text-gray-500 mb-1">
										Salary Range
									</div>
									<div className="text-black text-lg">
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
							<div className="pt-6 border-t border-black/10">
								<div className="text-sm text-gray-500 mb-2">
									Additional Information
								</div>
								<p className="text-gray-700 whitespace-pre-wrap text-lg leading-relaxed">
									{job.notes}
								</p>
							</div>
						)}

						{/* Footer */}
						<div className="pt-6 border-t border-black/10 flex items-center justify-between text-sm text-gray-500">
							<div>
								Posted by{" "}
								{job.poster?.fullName || job.poster?.email.split("@")[0]}
							</div>
							<div>
								{new Date(job.createdAt).toLocaleDateString("en-US", {
									year: "numeric",
									month: "long",
									day: "numeric",
								})}
							</div>
						</div>
					</div>
				</div>
			</main>
		</div>
	);
}
