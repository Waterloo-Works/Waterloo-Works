import Link from "next/link";
import Image from "next/image";
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

  const heroSrc = process.env.NEXT_PUBLIC_EXPLORE_HERO_IMAGE;

  return (
    <>
      {/* Top hero band with Waterloo building illustration */}
      <section className="relative h-[42vh] min-h-[280px] w-full overflow-hidden">
        {heroSrc ? (
          <Image
            src={heroSrc}
            alt="Waterloo building illustration"
            fill
            priority
            className="absolute inset-0 z-0 object-cover object-center"
          />
        ) : (
          <Image
            src="/goosephoto.png"
            alt="Waterloo building illustration"
            fill
            priority
            className="absolute inset-0 z-0 object-cover object-center"
          />
        )}
        {/* Tint + fade to white for smooth transition into content */}
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-white/40 via-transparent to-white/90" />

        {/* Pendulum shimmer (loops) under grid; pivot at top for stronger bottom motion */}
        <div className="absolute inset-0 z-[8] pointer-events-none overflow-hidden">
          <div className="ww-pendulum ww-pendulum--force" style={{ ['--pendulum-duration' as any]: '9s', opacity: 0.45 }} />
          <div className="ww-pendulum ww-pendulum--force" style={{ ['--pendulum-duration' as any]: '13s', opacity: 0.25, ['--pendulum-from' as any]: '-12deg', ['--pendulum-to' as any]: '12deg' }} />
        </div>
        {/* Keep grid ticks visible across the hero */}
        <div className="absolute inset-0 z-10">
          {/* Using the same utility textures as the shell */}
          <div className="grid-overlay-vert h-full opacity-40" />
          <div className="grid-overlay-ticks h-6 opacity-60" />
        </div>
      </section>

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

              <div className="grid items-stretch gap-7 sm:grid-cols-2 lg:grid-cols-3">
                {rankJobs(regionJobs).slice(0, 6).map((job) => (
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
    </>
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

// Lightweight ranking to prioritize relevant engineering roles.
function rankJobs(jobs: Job[]): Job[] {
  const now = Date.now();
  const positive: { pattern: RegExp; weight: number }[] = [
    { pattern: /(software|engineer|developer)/i, weight: 8 },
    { pattern: /(full[-\s]?stack)/i, weight: 6 },
    { pattern: /(frontend|front[-\s]?end)/i, weight: 5 },
    { pattern: /(backend|back[-\s]?end)/i, weight: 5 },
    { pattern: /(ml|machine learning|ai)/i, weight: 6 },
    { pattern: /(data engineer|platform|infrastructure|sre|security)/i, weight: 4 },
    { pattern: /(ios|android|mobile|web)/i, weight: 3 },
  ];
  const negative: { pattern: RegExp; weight: number }[] = [
    { pattern: /(operations|ops\b|customer|support|sales|marketing)/i, weight: 7 },
    { pattern: /(researcher|research)/i, weight: 5 },
    { pattern: /(associate|assistant)/i, weight: 3 },
  ];

  const score = (j: Job) => {
    let s = 0;
    const title = `${j.position} ${j.company}`;
    for (const r of positive) if (r.pattern.test(title)) s += r.weight;
    for (const r of negative) if (r.pattern.test(title)) s -= r.weight;
    // Recency boost: within 45 days gets up to +6
    const days = Math.max(0, Math.floor((now - new Date(j.createdAt).getTime()) / 86400000));
    s += Math.max(0, 6 - Math.floor(days / 8));
    // Full-time slightly preferred
    if (j.employmentType === "FULL_TIME") s += 2;
    // Salary presence implies stronger listing
    if (j.salaryMin || j.salaryMax) s += 1;
    return s;
  };

  return [...jobs].sort((a, b) => score(b) - score(a));
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
    <article className="relative group flex h-full flex-col justify-between rounded-2xl border border-zinc-200 bg-white p-6 min-h-[176px] shadow-sm transition-all hover:border-zinc-300 hover:bg-zinc-50 hover:shadow-md">
      {/* Full-card interactive overlay for hover and click */}
      <Link
        href={{ pathname: "/job-search", query: { selected: job.id } }}
        aria-label={`${job.company} — ${job.position}`}
        className="absolute inset-0 z-[10] rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300"
      />

      <div className="relative z-0 flex items-start gap-4">
        <FaviconImage src={job.companyImageUrl} company={job.company} />
        <div className="min-w-0">
          <div className="font-body text-sm text-zinc-600">{job.company}</div>
          <h3 className="font-header text-lg font-semibold text-zinc-900 group-hover:underline line-clamp-2">
            {job.position}
          </h3>
          <div className="font-body text-[15px] text-zinc-700">
            {compText ? `${compText} · ` : ""}{formatEmploymentType(job.employmentType)}
          </div>
          <div className="font-body text-sm text-zinc-500 mt-1">
            {job.location}
            {" · "}
            {timeAgo(job.createdAt)}
          </div>
        </div>
        <div className="relative z-[20] ml-auto">
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
