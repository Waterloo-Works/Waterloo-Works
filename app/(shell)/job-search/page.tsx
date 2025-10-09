import { Suspense } from "react";
import { getJobs } from "@/app/actions/jobs";
import JobSearchClient from "@/components/job-search/JobSearchClient";

export const metadata = { title: "Job Search" };

export default async function JobSearchPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>>; }) {
  const sp = await searchParams;
  return (
    <Suspense fallback={<JobSearchSkeleton />}> 
      <JobSearchContent initialSearchParams={sp} />
    </Suspense>
  );
}

async function JobSearchContent({ initialSearchParams }: { initialSearchParams: Record<string, string | string[] | undefined> }) {
  const jobs = await getJobs();
  return <JobSearchClient jobs={jobs} initialSearchParams={initialSearchParams} />;
}

function JobSearchSkeleton() {
  return (
    <div className="flex h-[calc(100svh-0px)]">
      <div className="w-[360px] border-r border-zinc-200 bg-white">
        <div className="border-b border-zinc-200 p-3">
          <div className="mb-3 flex gap-2">
            <div className="h-7 w-16 rounded-full bg-zinc-200" />
            <div className="h-7 w-16 rounded-full bg-zinc-200" />
          </div>
          <div className="h-9 w-full rounded-xl bg-zinc-200" />
        </div>
        <div className="space-y-0">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="border-b border-zinc-100 px-3 py-4">
              <div className="h-4 w-1/2 bg-zinc-200 rounded" />
              <div className="mt-2 h-5 w-3/4 bg-zinc-200 rounded" />
            </div>
          ))}
        </div>
      </div>
      <div className="flex-1">
        <div className="m-auto max-w-3xl p-8">
          <div className="h-6 w-1/3 bg-zinc-200 rounded" />
          <div className="mt-4 h-4 w-1/2 bg-zinc-200 rounded" />
          <div className="mt-6 space-y-2 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="h-5 w-1/4 bg-zinc-200 rounded" />
            <div className="h-4 w-1/2 bg-zinc-200 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}
