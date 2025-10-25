
import { Suspense } from "react";
import { getJobs } from "@/app/actions/jobs";
import JobSearchClient from "@/components/job-search/JobSearchClient";
import { Skeleton } from "@/components/ui/skeleton";

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
      <div className="w-[360px] border-r border-zinc-200 dark:border-border bg-white dark:bg-card p-4 flex flex-col">
        <div className="border-b border-zinc-200 dark:border-border pb-4 mb-4">
          <div className="mb-3 flex gap-2">
            <Skeleton className="h-7 w-16 rounded-full" />
            <Skeleton className="h-7 w-16 rounded-full" />
          </div>
          <Skeleton className="h-9 w-full rounded-xl" />
        </div>
        <div className="space-y-0">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="border-b border-zinc-100 dark:border-border px-3 py-4">
              <Skeleton className="h-4 w-1/2 rounded" />
              <Skeleton className="mt-2 h-5 w-3/4 rounded" />
            </div>
          ))}
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center">
        <div className="max-w-3xl w-full p-8">
          <Skeleton className="h-6 w-1/3 rounded" />
          <Skeleton className="mt-4 h-4 w-1/2 rounded" />
          <div className="mt-6 space-y-2 rounded-2xl border border-zinc-200 dark:border-border bg-white dark:bg-card p-6 shadow-sm">
            <Skeleton className="h-5 w-1/4 rounded" />
            <Skeleton className="h-4 w-1/2 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}
