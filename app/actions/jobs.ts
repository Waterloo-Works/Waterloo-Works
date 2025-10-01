"use server";

import { prisma } from "@/utils/prisma";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { getFaviconUrl } from "@/lib/favicon";
import { Job } from "@prisma/client";

export async function getJobs() {
	try {
		// Only return approved jobs with poster info
		const jobs = await prisma.job.findMany({
			where: {
				status: "APPROVED",
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
			orderBy: {
				createdAt: "desc",
			},
		});

		// Retroactively fetch favicons for jobs that don't have one
		const jobsNeedingFavicons = jobs.filter(
			(job: Job) => !job.companyImageUrl && job.companyUrl
		);

		if (jobsNeedingFavicons.length > 0) {
			// Fetch favicons in parallel
			await Promise.all(
				jobsNeedingFavicons.map(async job => {
					const faviconUrl = await getFaviconUrl(job.companyUrl);
					if (faviconUrl) {
						await prisma.job.update({
							where: { id: job.id },
							data: { companyImageUrl: faviconUrl },
						});
						// Update the job object with the new favicon
						job.companyImageUrl = faviconUrl;
					}
				})
			);
		}

		return jobs;
	} catch (error) {
		console.error("Error fetching jobs:", error);
		return [];
	}
}

export async function postJob(data: {
	company: string;
	companyUrl?: string;
	position: string;
	contact: string;
	contactUrl?: string;
	location: string;
	employmentType: "FULL_TIME" | "PART_TIME" | "CONTRACT" | "OTHER";
	salaryMin?: string;
	salaryMax?: string;
	notes?: string;
}) {
	try {
		const supabase = await createClient();
		const {
			data: { user },
		} = await supabase.auth.getUser();

		if (!user) {
			return { success: false, error: "You must be logged in to post a job" };
		}

		// Ensure user record exists in our database
		await prisma.user.upsert({
			where: { id: user.id },
			create: {
				id: user.id,
				email: user.email || "",
				fullName: user.user_metadata?.full_name || user.user_metadata?.name,
				source: user.user_metadata?.source,
			},
			update: {}, // Don't update if already exists
		});

		// Fetch favicon if company URL is provided
		const faviconUrl = data.companyUrl ? await getFaviconUrl(data.companyUrl) : null;

		// Create job with PENDING status by default
		await prisma.job.create({
			data: {
				company: data.company,
				companyUrl: data.companyUrl || null,
				companyImageUrl: faviconUrl,
				position: data.position,
				contact: data.contact,
				contactUrl: data.contactUrl || null,
				location: data.location,
				employmentType: data.employmentType,
				salaryMin: data.salaryMin || null,
				salaryMax: data.salaryMax || null,
				notes: data.notes || null,
				postedBy: user.id,
				status: "PENDING",
			},
		});

		return { success: true };
	} catch (error) {
		console.error("Error posting job:", error);
		return { success: false, error: "Failed to post job" };
	}
}

export async function getPendingJobs() {
	try {
		const jobs = await prisma.job.findMany({
			where: {
				status: "PENDING",
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
			orderBy: {
				createdAt: "desc",
			},
		});

		// Retroactively fetch favicons for jobs that don't have one
		const jobsNeedingFavicons = jobs.filter(
			job => !job.companyImageUrl && job.companyUrl
		);

		if (jobsNeedingFavicons.length > 0) {
			await Promise.all(
				jobsNeedingFavicons.map(async job => {
					const faviconUrl = await getFaviconUrl(job.companyUrl);
					if (faviconUrl) {
						await prisma.job.update({
							where: { id: job.id },
							data: { companyImageUrl: faviconUrl },
						});
						job.companyImageUrl = faviconUrl;
					}
				})
			);
		}

		return jobs;
	} catch (error) {
		console.error("Error fetching pending jobs:", error);
		return [];
	}
}

export async function approveJob(jobId: string) {
	try {
		const supabase = await createClient();
		const {
			data: { user },
		} = await supabase.auth.getUser();

		if (!user) {
			return { success: false, error: "You must be logged in" };
		}

		// Check if user is admin
		const userRecord = await prisma.user.findUnique({
			where: { id: user.id },
		});

		if (!userRecord?.isAdmin) {
			return { success: false, error: "You must be an admin to approve jobs" };
		}

		await prisma.job.update({
			where: { id: jobId },
			data: {
				status: "APPROVED",
				reviewedBy: user.id,
			},
		});

		revalidatePath("/admin");
		revalidatePath("/jobs");
		revalidatePath("/my-jobs");

		return { success: true };
	} catch (error) {
		console.error("Error approving job:", error);
		return { success: false, error: "Failed to approve job" };
	}
}

export async function rejectJob(jobId: string, reason: string) {
	try {
		const supabase = await createClient();
		const {
			data: { user },
		} = await supabase.auth.getUser();

		if (!user) {
			return { success: false, error: "You must be logged in" };
		}

		// Check if user is admin
		const userRecord = await prisma.user.findUnique({
			where: { id: user.id },
		});

		if (!userRecord?.isAdmin) {
			return { success: false, error: "You must be an admin to reject jobs" };
		}

		if (!reason.trim()) {
			return { success: false, error: "Rejection reason is required" };
		}

		await prisma.job.update({
			where: { id: jobId },
			data: {
				status: "REJECTED",
				reviewedBy: user.id,
				rejectionReason: reason,
			},
		});

		revalidatePath("/admin");
		revalidatePath("/my-jobs");

		return { success: true };
	} catch (error) {
		console.error("Error rejecting job:", error);
		return { success: false, error: "Failed to reject job" };
	}
}

export async function getMyJobs() {
	try {
		const supabase = await createClient();
		const {
			data: { user },
		} = await supabase.auth.getUser();

		if (!user) {
			return [];
		}

		// Get all jobs posted by the current user
		const jobs = await prisma.job.findMany({
			where: {
				postedBy: user.id,
			},
			include: {
				reviewer: {
					select: {
						id: true,
						fullName: true,
						email: true,
					},
				},
			},
			orderBy: {
				createdAt: "desc",
			},
		});

		// Retroactively fetch favicons for jobs that don't have one
		const jobsNeedingFavicons = jobs.filter(
			job => !job.companyImageUrl && job.companyUrl
		);

		if (jobsNeedingFavicons.length > 0) {
			await Promise.all(
				jobsNeedingFavicons.map(async job => {
					const faviconUrl = await getFaviconUrl(job.companyUrl);
					if (faviconUrl) {
						await prisma.job.update({
							where: { id: job.id },
							data: { companyImageUrl: faviconUrl },
						});
						job.companyImageUrl = faviconUrl;
					}
				})
			);
		}

		return jobs;
	} catch (error) {
		console.error("Error fetching my jobs:", error);
		return [];
	}
}

export async function getJobById(jobId: string) {
	try {
		const supabase = await createClient();
		const {
			data: { user },
		} = await supabase.auth.getUser();

		if (!user) {
			return null;
		}

		const job = await prisma.job.findUnique({
			where: { id: jobId },
		});

		// Verify the user owns this job
		if (!job || job.postedBy !== user.id) {
			return null;
		}

		return job;
	} catch (error) {
		console.error("Error fetching job:", error);
		return null;
	}
}

export async function updateJob(
	jobId: string,
	data: {
		company: string;
		companyUrl?: string;
		position: string;
		contact: string;
		contactUrl?: string;
		location: string;
		employmentType: "FULL_TIME" | "PART_TIME" | "CONTRACT" | "OTHER";
		salaryMin?: string;
		salaryMax?: string;
		notes?: string;
	}
) {
	try {
		const supabase = await createClient();
		const {
			data: { user },
		} = await supabase.auth.getUser();

		if (!user) {
			return { success: false, error: "You must be logged in to update a job" };
		}

		// Get the existing job
		const existingJob = await prisma.job.findUnique({
			where: { id: jobId },
		});

		if (!existingJob) {
			return { success: false, error: "Job not found" };
		}

		// Verify the user owns this job
		if (existingJob.postedBy !== user.id) {
			return {
				success: false,
				error: "You don't have permission to edit this job",
			};
		}

		// Fetch new favicon if company URL changed
		let faviconUrl = existingJob.companyImageUrl;
		if (data.companyUrl && data.companyUrl !== existingJob.companyUrl) {
			faviconUrl = await getFaviconUrl(data.companyUrl);
		}

		// If the job was rejected and is being edited, set status back to PENDING
		const newStatus =
			existingJob.status === "REJECTED" ? "PENDING" : existingJob.status;

		// Update job
		await prisma.job.update({
			where: { id: jobId },
			data: {
				company: data.company,
				companyUrl: data.companyUrl || null,
				companyImageUrl: faviconUrl,
				position: data.position,
				contact: data.contact,
				contactUrl: data.contactUrl || null,
				location: data.location,
				employmentType: data.employmentType,
				salaryMin: data.salaryMin || null,
				salaryMax: data.salaryMax || null,
				notes: data.notes || null,
				status: newStatus,
				// Clear rejection reason if it was rejected
				rejectionReason:
					existingJob.status === "REJECTED"
						? null
						: existingJob.rejectionReason,
				// Clear reviewer if resubmitting
				reviewedBy:
					existingJob.status === "REJECTED" ? null : existingJob.reviewedBy,
			},
		});

		revalidatePath("/my-jobs");
		revalidatePath("/admin");
		if (existingJob.status === "APPROVED") {
			revalidatePath("/jobs");
		}

		return { success: true };
	} catch (error) {
		console.error("Error updating job:", error);
		return { success: false, error: "Failed to update job" };
	}
}
