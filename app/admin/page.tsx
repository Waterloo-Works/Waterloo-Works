import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { getPendingJobs } from "@/app/actions/jobs";
import { prisma } from "@/utils/prisma";
import Navbar from "@/components/Navbar";
import FaviconImage from "@/components/FaviconImage";
import ApprovalButtons from "./ApprovalButtons";
import { formatEmploymentType } from "@/lib/formatEmploymentType";

export default async function AdminPage() {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		redirect("/login");
	}

	// Ensure user record exists and check admin status
	const userRecord = await prisma.user.upsert({
		where: { id: user.id },
		create: {
			id: user.id,
			email: user.email || "",
			fullName: user.user_metadata?.full_name || user.user_metadata?.name,
			source: user.user_metadata?.source,
		},
		update: {},
	});

	if (!userRecord.isAdmin) {
		redirect("/dashboard");
	}

	const pendingJobs = await getPendingJobs();

	return (
		<div className="min-h-screen bg-[#F5F1E8]">
			<Navbar />

			{/* Main Content */}
			<main className="max-w-6xl mx-auto px-6 py-12">
				<div className="mb-12">
					<h1 className="text-4xl md:text-5xl lg:text-6xl font-serif italic text-black mb-4">
						Admin Dashboard
					</h1>
					<p className="text-lg md:text-xl text-gray-700">
						Review and approve job submissions
					</p>
				</div>

				{/* Pending Jobs */}
				<div>
					<h2 className="text-2xl font-serif font-semibold text-black mb-6">
						Pending Submissions ({pendingJobs.length})
					</h2>

					{pendingJobs.length === 0 ? (
						<div className="text-center py-20 bg-white/60 backdrop-blur-sm border border-black/10 rounded-lg">
							<div className="inline-block w-16 h-16 bg-gray-200 rounded-full mb-4"></div>
							<h3 className="text-xl font-serif mb-2">
								No pending submissions
							</h3>
							<p className="text-gray-600">
								All job submissions have been reviewed
							</p>
						</div>
					) : (
						<div className="space-y-4">
							{pendingJobs.map(job => (
								<div
									key={job.id}
									className="bg-white/60 backdrop-blur-sm border border-black/10 rounded-lg p-6"
								>
									<div className="space-y-4">
										{/* Position Title */}
										<div className="flex items-start justify-between gap-4">
											<div className="flex items-start gap-3 flex-1">
												<FaviconImage
													src={job.companyImageUrl}
													company={job.company}
												/>
												<h3 className="text-xl md:text-2xl font-serif font-semibold text-black">
													{job.position}
												</h3>
											</div>
											<span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
												Pending Review
											</span>
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
													{formatEmploymentType(
														job.employmentType
													)}
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

										{/* Footer with Actions */}
										<div className="pt-4 border-t border-black/10 flex items-center justify-between">
											<div className="flex flex-col gap-1">
												<span className="text-xs text-gray-500">
													Submitted{" "}
													{new Date(
														job.createdAt
													).toLocaleDateString()}
												</span>
												{job.poster && (
													<span className="text-xs text-gray-500">
														by{" "}
														{job.poster.fullName ||
															job.poster.email.split(
																"@"
															)[0]}
													</span>
												)}
											</div>
											<ApprovalButtons jobId={job.id} />
										</div>
									</div>
								</div>
							))}
						</div>
					)}
				</div>
			</main>
		</div>
	);
}
