import Link from "next/link";
import { Suspense } from "react";
import PageHeaderPortal from "@/components/PageHeaderPortal";
import { getBookmarkedJobIds } from "@/app/actions/bookmarks";
import { getJobs } from "@/app/actions/jobs";
import FaviconImage from "@/components/FaviconImage";
import { formatEmploymentType } from "@/lib/formatEmploymentType";
import { timeAgo } from "@/lib/timeAgo";

export const metadata = { title: "Saved" };

export default async function SavedPage() {
  return (
    <div className="mx-auto max-w-6xl px-8 py-14">
      <PageHeaderPortal>
        <h1 className="text-xl font-semibold tracking-tight text-zinc-900">Saved</h1>
      </PageHeaderPortal>
      <h1 className="mb-10 text-3xl font-semibold tracking-tight text-zinc-900 md:hidden">Saved</h1>
      <Suspense fallback={<SavedSkeleton />}> 
        {/* Server fragment renders saved jobs */}
        <SavedList />
      </Suspense>
    </div>
  );
}

async function SavedList() {
  const ids = await getBookmarkedJobIds();
  const all = await getJobs();
  const jobs = all.filter((j) => ids.has(j.id));

  if (jobs.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="inline-block h-16 w-16 rounded-full bg-zinc-100 mb-4" />
        <h3 className="font-title text-xl text-zinc-900 mb-2">No saved jobs yet</h3>
        <p className="font-body text-zinc-600">Tap the bookmark icon on any job to save it for later.</p>
        <div className="mt-6">
          <Link href="/explore" className="rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-800 hover:bg-zinc-50">Back to Explore</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grid items-stretch gap-6 md:grid-cols-2 lg:grid-cols-3">
      {jobs.map((job: Awaited<ReturnType<typeof getJobs>>[number]) => (
        <article key={job.id} className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <FaviconImage src={job.companyImageUrl} company={job.company} />
            <div className="min-w-0">
              <div className="font-body text-sm text-zinc-600">{job.company}</div>
              <Link href={{ pathname: "/job-search", query: { selected: job.id } }} className="group block">
                <h3 className="font-title text-lg font-semibold text-zinc-900 group-hover:underline line-clamp-2">{job.position}</h3>
              </Link>
              <div className="font-body text-[15px] text-zinc-700">
                {job.salaryMin && job.salaryMax ? `${job.salaryMin} - ${job.salaryMax} · ` : ""}
                {formatEmploymentType(job.employmentType)}
              </div>
              <div className="font-body text-sm text-zinc-500 mt-1">{job.location} · {timeAgo(job.createdAt)}</div>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

function SavedSkeleton() {
  return (
    <div className="grid items-stretch gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="animate-pulse rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 rounded-lg bg-zinc-200" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-1/3 bg-zinc-200 rounded" />
              <div className="h-5 w-2/3 bg-zinc-200 rounded" />
              <div className="h-4 w-1/2 bg-zinc-200 rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
