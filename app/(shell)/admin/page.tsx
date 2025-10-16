import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { getPendingJobs } from "@/app/actions/jobs";
import { prisma } from "@/utils/prisma";
import FaviconImage from "@/components/FaviconImage";
import ApprovalButtons from "./ApprovalButtons";
import { formatEmploymentType } from "@/lib/formatEmploymentType";
import { timeAgo } from "@/lib/timeAgo";

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

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
  if (!userRecord.isAdmin) redirect("/explore");

  const pendingJobs = await getPendingJobs();

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <div className="mb-8">
        <h1 className="font-header text-3xl md:text-4xl font-semibold tracking-tight text-zinc-900 mb-2">Admin Dashboard</h1>
        <p className="font-body text-zinc-700">Review and approve job submissions</p>
      </div>

      <div>
        <h2 className="text-xl font-header font-semibold text-zinc-900 mb-4">Pending Submissions ({pendingJobs.length})</h2>

        {pendingJobs.length === 0 ? (
          <div className="text-center py-20 rounded-2xl bg-white ring-1 ring-zinc-200">
            <div className="inline-block w-16 h-16 bg-zinc-100 rounded-full mb-4" />
            <h3 className="font-header text-xl text-zinc-900 mb-2">No pending submissions</h3>
            <p className="font-body text-zinc-600">All job submissions have been reviewed</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingJobs.map((job) => (
              <div key={job.id} className="rounded-2xl bg-white p-6 ring-1 ring-zinc-200 shadow-sm">
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <FaviconImage src={job.companyImageUrl} company={job.company} />
                      <h3 className="font-header text-xl md:text-2xl font-semibold text-zinc-900">{job.position}</h3>
                    </div>
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">Pending Review</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
                    <div>
                      <div className="text-sm text-zinc-500 mb-1">Company</div>
                      {job.companyUrl ? (
                        <a href={job.companyUrl} target="_blank" rel="noopener noreferrer" className="text-zinc-900 hover:underline flex items-center gap-1">
                          {job.company}
                          <span className="text-xs">↗</span>
                        </a>
                      ) : (
                        <div className="text-zinc-900">{job.company}</div>
                      )}
                    </div>

                    <div>
                      <div className="text-sm text-zinc-500 mb-1">Contact Name</div>
                      {job.contactUrl ? (
                        <a href={job.contactUrl} target="_blank" rel="noopener noreferrer" className="text-zinc-900 hover:underline flex items-center gap-1">
                          {job.contact}
                          <span className="text-xs">↗</span>
                        </a>
                      ) : (
                        <div className="text-zinc-900">{job.contact}</div>
                      )}
                    </div>

                    <div>
                      <div className="text-sm text-zinc-500 mb-1">Location</div>
                      <div className="text-zinc-900">{job.location}</div>
                    </div>

                    <div>
                      <div className="text-sm text-zinc-500 mb-1">Employment Type</div>
                      <div className="text-zinc-900">{formatEmploymentType(job.employmentType)}</div>
                    </div>

                    {(job.salaryMin || job.salaryMax) && (
                      <div>
                        <div className="text-sm text-zinc-500 mb-1">Salary Range</div>
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

                    <div className="pt-4 border-t border-zinc-200 flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-zinc-500">Submitted {timeAgo(job.createdAt)}</span>
                      {job.poster && (
                        <span className="text-xs text-zinc-500">by {job.poster.fullName || job.poster.email.split("@")[0]}</span>
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
  );
}
