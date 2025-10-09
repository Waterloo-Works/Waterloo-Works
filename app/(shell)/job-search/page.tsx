import { getJobs } from "@/app/actions/jobs";
import JobSearchClient from "@/components/job-search/JobSearchClient";

export const metadata = { title: "Job Search" };

export default async function JobSearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const jobs = await getJobs();
  const sp = await searchParams;
  return <JobSearchClient jobs={jobs} initialSearchParams={sp} />;
}

