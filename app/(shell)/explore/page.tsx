import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { getJobs } from "@/app/actions/jobs";
import FaviconImage from "@/components/FaviconImage";
import ShareButton from "@/components/ShareButton";
import PageHeaderPortal from "@/components/PageHeaderPortal";
import BookmarkButton from "@/components/BookmarkButton";
import CreateAlertButton from "@/components/CreateAlertButton";
import { getRegionAlertMap } from "@/app/actions/alerts";
import { getBookmarkedJobIds } from "@/app/actions/bookmarks";
import { formatEmploymentType } from "@/lib/formatEmploymentType";
import { timeAgo } from "@/lib/timeAgo";

export const metadata = { title: "Explore" };

export default async function ExplorePage() {
  const jobs = await getJobs();
  const captureSnippet = `try{window.posthog&&window.posthog.capture('explore_loaded')}catch{}`;

  const regions = groupJobsByRegion(jobs);

  // Preload initial bookmark/alert state (gracefully no-ops if models missing)
  const bookmarked = await getBookmarkedJobIds();
  const alertMap = await getRegionAlertMap();

  const dmRecipientId = process.env.NEXT_PUBLIC_X_DM_RECIPIENT_ID;
  const dmHref = dmRecipientId
    ? `https://x.com/messages/compose?recipient_id=${dmRecipientId}`
    : "https://x.com/onlychans1";

  const globalAlertActive = Boolean(alertMap.get("ALL"));

  return (
    <div className="mx-auto max-w-6xl px-8 py-14">
      <script dangerouslySetInnerHTML={{ __html: captureSnippet }} />
      {/* Desktop: title + actions in header */}
      <PageHeaderPortal>
        <h1 className="text-xl font-semibold tracking-tight text-zinc-900">Explore</h1>
        <div className="hidden md:block">
          <CreateAlertButton region="ALL" initialActive={globalAlertActive} />
        </div>
      </PageHeaderPortal>

      {/* Mobile: title inside page with actions */}
      <div className="mb-8 md:hidden">
        <h1 className="mb-6 text-3xl font-semibold tracking-tight text-zinc-900">Explore</h1>
        <div className="flex items-center justify-end">
          <CreateAlertButton region="ALL" initialActive={globalAlertActive} />
        </div>
      </div>

      {Object.keys(regions).length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-16">
          {Object.entries(regions).map(([region, regionJobs]) => (
            <section key={region} className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-medium text-zinc-900">
                  <Link
                    href={
                      region === "Remote"
                        ? { pathname: "/job-search", query: { remote: "true" } }
                        : { pathname: "/job-search", query: { loc: region.toLowerCase() } }
                    }
                    className="group inline-flex items-center gap-2 hover:underline underline-offset-4"
                  >
                    {region === "Remote"
                      ? "Job picks for remote software roles"
                      : `Job picks for software developers and engineers in ${region}`}
                    <ChevronRight className="h-5 w-5 text-zinc-500 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </h2>
              </div>

              <div className="grid items-stretch gap-7 lg:grid-cols-2 xl:grid-cols-3">
                {regionJobs.slice(0, 3).map((job) => (
                  <JobPreviewCard key={job.id} job={job} initialBookmarked={bookmarked.has(job.id)} />)
                )}
              </div>
            </section>
          ))}

          <section className="space-y-3">
            <div className="font-body text-sm text-zinc-600">
              Not what you’re looking for? {" "}
              <a
                href={dmHref}
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                Let us know!
              </a>
              .
            </div>

            <div className="pt-2">
              <h3 className="mb-4 text-lg font-medium text-zinc-900">Suggested job searches</h3>
              <div className="flex flex-wrap gap-3">
                {suggestedSearches.map((s) => (
                  <Link
                    key={s.label}
                    href={{ pathname: "/job-search", query: s.query }}
                    className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1 text-sm text-zinc-700 shadow-sm hover:bg-zinc-50"
                  >
                    <span>🔍</span>
                    <span>{s.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

const suggestedSearches = [
  { label: "San Francisco", query: { loc: "san francisco" } },
  { label: "New York", query: { loc: "new york" } },
  { label: "Toronto", query: { loc: "toronto" } },
  { label: "Remote", query: { remote: "true" } },
  { label: "Internship", query: { type: "INTERNSHIP" } },
];

type Jobs = Awaited<ReturnType<typeof getJobs>>;
type Job = Jobs[number];

function groupJobsByRegion(jobs: Jobs): Record<string, Job[]> {
  const ORDER = ["San Francisco", "New York", "Toronto", "Remote"] as const;
  const buckets: Record<string, Job[]> = {
    "San Francisco": [],
    "New York": [],
    "Toronto": [],
    Remote: [],
  };

  const add = (key: typeof ORDER[number], job: Job) => {
    buckets[key].push(job);
  };

  for (const job of jobs) {
    const loc = (job.location || "").toLowerCase();
    if (/(remote|anywhere|work from home|wfh|distributed)/.test(loc)) {
      add("Remote", job);
      continue;
    }
    if (/(san francisco|\bsf\b|bay area|san mateo|palo alto|san jose|oakland|berkeley|mountain view|menlo park|redwood city|cupertino|sunnyvale|santa clara|fremont)/.test(loc)) {
      add("San Francisco", job);
      continue;
    }
    if (/(new york|nyc|brooklyn|manhattan|queens|bronx|staten island)/.test(loc)) {
      add("New York", job);
      continue;
    }
    if (/(toronto|gta|mississauga|scarborough|north york|etobicoke|markham|vaughan|richmond hill|brampton)/.test(loc)) {
      add("Toronto", job);
      continue;
    }
    // Ignore other regions for the Explore page by design
  }

  // Return only non-empty buckets, in the desired order
  const result: Record<string, Job[]> = {};
  for (const key of ORDER) {
    if (buckets[key].length > 0) result[key] = buckets[key];
  }
  return result;
}

function JobPreviewCard({
  job,
  initialBookmarked,
}: {
  job: Awaited<ReturnType<typeof getJobs>>[number];
  initialBookmarked: boolean;
}) {
  const compText = job.salaryMin && job.salaryMax
    ? `${job.salaryMin} - ${job.salaryMax}`
    : job.salaryMin
    ? `${job.salaryMin}+`
    : job.salaryMax
    ? `Up to ${job.salaryMax}`
    : undefined;

  return (
    <article className="flex h-full flex-col justify-between rounded-2xl border border-zinc-200 bg-white p-6 min-h-[176px] shadow-sm transition-all hover:border-zinc-300 hover:bg-zinc-50 hover:shadow-md focus-within:ring-1 focus-within:ring-zinc-300">
      <div className="flex items-start gap-4">
        <FaviconImage src={job.companyImageUrl} company={job.company} />
        <div className="min-w-0">
          <div className="font-body text-sm text-zinc-600">{job.company}</div>
          <Link
            href={{ pathname: "/job-search", query: { selected: job.id } }}
            className="group block focus-visible:outline-none"
          >
            <h3 className="font-header text-lg font-semibold text-zinc-900 group-hover:underline line-clamp-2">
              {job.position}
            </h3>
          </Link>
          <div className="font-body text-[15px] text-zinc-700">
            {compText ? `${compText} · ` : ""}{formatEmploymentType(job.employmentType)}
          </div>
          <div className="font-body text-sm text-zinc-500 mt-1">
            {job.location}
            {" · "}
            {timeAgo(job.createdAt)}
          </div>
        </div>
        <div className="ml-auto">
          <BookmarkButton jobId={job.id} initial={initialBookmarked} />
        </div>
      </div>
    </article>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-20">
      <div className="inline-block h-16 w-16 rounded-full bg-zinc-100 mb-4" />
      <h3 className="font-header text-xl text-zinc-900 mb-2">No listings yet</h3>
      <p className="font-body text-zinc-600">Check back soon for fresh roles.</p>
    </div>
  );
}
