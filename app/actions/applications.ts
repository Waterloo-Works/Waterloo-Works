"use server";

import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/utils/prisma";
import { ApplicationStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

export type BatchApplyResult = {
  success: boolean;
  appliedCount: number;
  skippedCount: number;
  failedCount: number;
  errors: { jobId: string; error: string }[];
};

export type ApplicationWithJob = {
  id: string;
  jobId: string;
  status: ApplicationStatus;
  appliedAt: Date;
  notes: string | null;
  job: {
    id: string;
    company: string;
    companyImageUrl: string | null;
    position: string;
    location: string;
    employmentType: string;
    salaryMin: string | null;
    salaryMax: string | null;
    contactUrl: string | null;
  };
};

/**
 * Submit batch applications to multiple jobs
 */
export async function batchApply(params: {
  jobIds: string[];
  notes?: string;
}): Promise<BatchApplyResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("User not authenticated");
    }

    // Validate input
    if (!params.jobIds || params.jobIds.length === 0) {
      throw new Error("No jobs selected");
    }

    if (params.jobIds.length > 20) {
      throw new Error("Maximum 20 applications per batch");
    }

    // Check if user has a profile with resume
    const userProfile = await prisma.userProfile.findUnique({
      where: { userId: user.id },
      select: { resumeUrl: true, resumeFileName: true },
    });

    if (!userProfile?.resumeUrl) {
      throw new Error("Please upload your resume before applying to jobs");
    }

    // Validate all jobs exist and are approved
    const jobs = await prisma.job.findMany({
      where: {
        id: { in: params.jobIds },
        status: "APPROVED",
      },
      select: { id: true },
    });

    if (jobs.length !== params.jobIds.length) {
      throw new Error("Some jobs are no longer available");
    }

    // Check for existing applications
    const existingApplications = await prisma.application.findMany({
      where: {
        userId: user.id,
        jobId: { in: params.jobIds },
      },
      select: { jobId: true },
    });

    const existingJobIds = new Set(
      existingApplications.map((app) => app.jobId)
    );
    const newJobIds = params.jobIds.filter((id) => !existingJobIds.has(id));

    // Create applications for new jobs
    const applications = newJobIds.map((jobId) => ({
      userId: user.id,
      jobId,
      status: "PENDING" as ApplicationStatus,
      notes: params.notes || null,
    }));

    const result = await prisma.application.createMany({
      data: applications,
      skipDuplicates: true,
    });

    // Revalidate relevant pages
    revalidatePath("/job-search");
    revalidatePath("/applications");
    revalidatePath("/bookmarks");

    return {
      success: true,
      appliedCount: result.count,
      skippedCount: existingJobIds.size,
      failedCount: 0,
      errors: [],
    };
  } catch (error) {
    console.error("Batch apply error:", error);
    return {
      success: false,
      appliedCount: 0,
      skippedCount: 0,
      failedCount: params.jobIds.length,
      errors: [
        {
          jobId: "all",
          error:
            error instanceof Error ? error.message : "Failed to apply to jobs",
        },
      ],
    };
  }
}

/**
 * Get user's applications with job details
 */
export async function getMyApplications(): Promise<ApplicationWithJob[]> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return [];
    }

    const applications = await prisma.application.findMany({
      where: { userId: user.id },
      include: {
        job: {
          select: {
            id: true,
            company: true,
            companyImageUrl: true,
            position: true,
            location: true,
            employmentType: true,
            salaryMin: true,
            salaryMax: true,
            contactUrl: true,
          },
        },
      },
      orderBy: { appliedAt: "desc" },
    });

    return applications;
  } catch (error) {
    console.error("Get applications error:", error);
    return [];
  }
}

/**
 * Check if user has already applied to specific jobs
 */
export async function checkApplicationStatus(
  jobIds: string[]
): Promise<Map<string, ApplicationStatus | null>> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return new Map(jobIds.map((id) => [id, null]));
    }

    const applications = await prisma.application.findMany({
      where: {
        userId: user.id,
        jobId: { in: jobIds },
      },
      select: {
        jobId: true,
        status: true,
      },
    });

    const statusMap = new Map<string, ApplicationStatus | null>(
      jobIds.map((id) => [id, null])
    );

    applications.forEach((app) => {
      statusMap.set(app.jobId, app.status);
    });

    return statusMap;
  } catch (error) {
    console.error("Check application status error:", error);
    return new Map(jobIds.map((id) => [id, null]));
  }
}

/**
 * Get application statistics for the user
 */
export async function getApplicationStats() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        total: 0,
        pending: 0,
        viewed: 0,
        interviewing: 0,
        rejected: 0,
        accepted: 0,
      };
    }

    const applications = await prisma.application.groupBy({
      by: ["status"],
      where: { userId: user.id },
      _count: true,
    });

    const stats = {
      total: 0,
      pending: 0,
      viewed: 0,
      interviewing: 0,
      rejected: 0,
      accepted: 0,
    };

    applications.forEach((group) => {
      stats.total += group._count;
      stats[group.status.toLowerCase() as keyof typeof stats] = group._count;
    });

    return stats;
  } catch (error) {
    console.error("Get application stats error:", error);
    return {
      total: 0,
      pending: 0,
      viewed: 0,
      interviewing: 0,
      rejected: 0,
      accepted: 0,
    };
  }
}

/**
 * Delete an application (withdraw)
 */
export async function withdrawApplication(applicationId: string) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("User not authenticated");
    }

    // Verify the application belongs to the user
    const application = await prisma.application.findFirst({
      where: {
        id: applicationId,
        userId: user.id,
      },
    });

    if (!application) {
      throw new Error("Application not found");
    }

    await prisma.application.delete({
      where: { id: applicationId },
    });

    revalidatePath("/applications");
    revalidatePath("/job-search");

    return { success: true };
  } catch (error) {
    console.error("Withdraw application error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to withdraw application",
    };
  }
}
