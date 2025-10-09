import Link from "next/link";
import { getBookmarkedJobIds } from "@/app/actions/bookmarks";
import { getJobs } from "@/app/actions/jobs";
import FaviconImage from "@/components/FaviconImage";
import { formatEmploymentType } from "@/lib/formatEmploymentType";
import { timeAgo } from "@/lib/timeAgo";

export const metadata = { title: "Saved" };

export default async function SavedPage() {
  const ids = await getBookmarkedJobIds();
  const all = await getJobs();
  const jobs = all.filter(j => ids.has(j.id));

  return (
    <div className="mx-auto max-w-6xl px-8 py-14">
      <h1 className="mb-10 text-3xl font-semibold tracking-tight text-zinc-900">Saved</h1>
      {jobs.length === 0 ? (
        <div className="text-center py-20">
          <div className="inline-block h-16 w-16 rounded-full bg-zinc-100 mb-4" />
          <h3 className="font-title text-xl text-zinc-900 mb-2">No saved jobs yet</h3>
          <p className="font-body text-zinc-600">Tap the bookmark icon on any job to save it for later.</p>
          <div className="mt-6">
            <Link href="/explore" className="rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-800 hover:bg-zinc-50">Back to Explore</Link>
          </div>
        </div>
      ) : (
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
      )}
    </div>
  );
}
