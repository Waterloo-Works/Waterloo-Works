import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getMyJobs } from "@/app/actions/jobs";
import FaviconImage from "@/components/FaviconImage";
import { formatEmploymentType } from "@/lib/formatEmploymentType";

type Job = {
	id: string;
	company: string;
	companyUrl: string | null;
	companyImageUrl: string | null;
	position: string;
	contact: string;
	contactUrl: string | null;
	location: string;
	employmentType: "FULL_TIME" | "PART_TIME" | "CONTRACT" | "OTHER";
	salaryMin: string | null;
	salaryMax: string | null;
	notes: string | null;
	status: "PENDING" | "APPROVED" | "REJECTED";
	rejectionReason: string | null;
	createdAt: Date;
	reviewer: {
		id: string;
		fullName: string | null;
		email: string;
	} | null;
};

export default async function MyJobsPage() {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		redirect("/login");
	}

	const myJobs: Job[] = await getMyJobs();

    return (
            /* Main Content */
            <main className="mx-auto max-w-6xl px-6 py-12">
				{/* Header */}
                <div className="mb-8">
                    <h1 className="font-title text-3xl md:text-4xl font-semibold tracking-tight text-zinc-900 mb-2">
                        My Job Submissions
                    </h1>
                    <p className="font-body text-zinc-700">
                        Track the status of your job postings
                    </p>
                </div>

				{/* Job Listings */}
                {myJobs.length === 0 ? (
                    <div className="text-center py-20 rounded-2xl bg-white ring-1 ring-zinc-200">
                        <div className="inline-block w-16 h-16 bg-gray-200 rounded-full mb-4"></div>
                        <h3 className="font-title text-xl text-zinc-900 mb-2">
                            No job submissions yet
                        </h3>
                        <p className="font-body text-zinc-600 mb-6">
                            Post your first job to get started
                        </p>
                        <Link
                            href="/post-job"
                            className="inline-block rounded-full bg-zinc-900 px-6 py-3 text-white hover:bg-zinc-800 transition-colors"
                        >
                            Post a Job
                        </Link>
                    </div>
                ) : (
					<div className="space-y-4">
						{myJobs.map(job => (
                            <div
                                key={job.id}
                                className="rounded-2xl bg-white p-6 ring-1 ring-zinc-200 shadow-sm"
                            >
								<div className="space-y-4">
									{/* Header with Status Badge */}
									<div className="flex items-start justify-between gap-4">
										<div className="flex items-start gap-3 flex-1">
											<FaviconImage
												src={job.companyImageUrl}
												company={job.company}
											/>
                                        <h3 className="font-title text-xl md:text-2xl font-semibold text-zinc-900">
                                            {job.position}
                                        </h3>
										</div>
										{job.status === "APPROVED" ? (
											<span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium whitespace-nowrap">
												✓ Approved
											</span>
										) : job.status === "REJECTED" ? (
											<span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium whitespace-nowrap">
												✗ Rejected
											</span>
										) : (
											<span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium whitespace-nowrap">
												⏳ Pending Review
											</span>
										)}
									</div>

									{/* Job Details Grid */}
									<div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
										<div>
                                            <div className="text-sm text-zinc-500 mb-1">
												Company
											</div>
											{job.companyUrl ? (
												<a
													href={job.companyUrl}
													target="_blank"
													rel="noopener noreferrer"
                                                    className="text-zinc-900 hover:underline flex items-center gap-1"
												>
													{job.company}
													<span className="text-xs">↗</span>
												</a>
											) : (
                                                <div className="text-zinc-900">
													{job.company}
												</div>
											)}
										</div>

										<div>
                                            <div className="text-sm text-zinc-500 mb-1">
												Contact Name
											</div>
											{job.contactUrl ? (
												<a
													href={job.contactUrl}
													target="_blank"
													rel="noopener noreferrer"
                                                    className="text-zinc-900 hover:underline flex items-center gap-1"
												>
													{job.contact}
													<span className="text-xs">↗</span>
												</a>
											) : (
                                                <div className="text-zinc-900">
													{job.contact}
												</div>
											)}
										</div>

										<div>
                                            <div className="text-sm text-zinc-500 mb-1">
												Location
											</div>
                                            <div className="text-zinc-900">
												{job.location}
											</div>
										</div>

										<div>
                                            <div className="text-sm text-zinc-500 mb-1">
												Employment Type
											</div>
                                            <div className="text-zinc-900">
												{formatEmploymentType(job.employmentType)}
											</div>
										</div>

										{(job.salaryMin || job.salaryMax) && (
											<div>
                                                <div className="text-sm text-zinc-500 mb-1">
													Salary Range
												</div>
                                                <div className="text-zinc-900">
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
                                            <div className="text-sm text-zinc-500 mb-1">
                                                Notes
                                            </div>
                                            <p className="text-zinc-700 whitespace-pre-wrap">
                                                {job.notes}
                                            </p>
                                        </div>
                                    )}

									{/* Rejection Reason */}
									{job.status === "REJECTED" && job.rejectionReason && (
										<div className="p-4 bg-red-50 border border-red-200 rounded-lg">
											<div className="text-sm font-medium text-red-700 mb-1">
												Rejection Reason
											</div>
											<p className="text-red-600 whitespace-pre-wrap">
												{job.rejectionReason}
											</p>
										</div>
									)}

									{/* Footer */}
                                    <div className="pt-4 border-t border-zinc-200 flex items-center justify-between text-xs text-zinc-500">
										<div className="flex items-center gap-4">
											<span>
												Submitted{" "}
												{new Date(
													job.createdAt
												).toLocaleDateString()}
											</span>
											{job.status === "APPROVED" &&
												job.reviewer && (
													<span>
														Approved by{" "}
														{job.reviewer.fullName ||
															job.reviewer.email.split(
																"@"
															)[0]}
													</span>
												)}
											{job.status === "REJECTED" &&
												job.reviewer && (
													<span>
														Rejected by{" "}
														{job.reviewer.fullName ||
															job.reviewer.email.split(
																"@"
															)[0]}
													</span>
												)}
										</div>
                                    <Link
                                        href={`/jobs/${job.id}/edit`}
                                        className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 transition-colors"
                                    >
                                        Edit
                                    </Link>
									</div>
								</div>
							</div>
						))}
					</div>
				)}
            </main>
    );
}
