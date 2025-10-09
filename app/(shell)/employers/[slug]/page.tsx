import Link from "next/link";
import { Suspense } from "react";
import FaviconImage from "@/components/FaviconImage";
import { getCompany } from "@/app/actions/companies";
import { formatEmploymentType } from "@/lib/formatEmploymentType";
import { timeAgo } from "@/lib/timeAgo";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { company } = await getCompany(slug);
  return { title: company ? `${company.name} · Employers` : "Company · Employers" };
}

export default async function CompanyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return (
    <div className="mx-auto max-w-4xl px-8 py-10">
      <Suspense fallback={<CompanySkeleton />}> 
        <CompanyContent slug={slug} />
      </Suspense>
    </div>
  );
}

async function CompanyContent({ slug }: { slug: string }) {
  const { company, jobs, people } = await getCompany(slug);
  if (!company) {
    return (
      <div className="py-10">
        <h1 className="font-title text-2xl font-semibold text-zinc-900">Company not found</h1>
        <p className="font-body text-zinc-600 mt-2">This employer doesn’t exist. Go back to the <Link href="/employers" className="underline">Employers</Link> index.</p>
      </div>
    );
  }

  return (
    <>
      {/* Company header */}
      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <FaviconImage src={company.logoUrl || null} company={company.name} />
          <div className="min-w-0">
            <h1 className="font-title text-2xl font-semibold text-zinc-900">{company.name}</h1>
            <div className="font-body text-sm text-zinc-600">
              {company.domain ? (
                <a href={`https://${company.domain}`} target="_blank" rel="noopener noreferrer" className="underline">
                  {company.domain}
                </a>
              ) : (
                company.website || ""
              )}
            </div>
          </div>
        </div>
        {company.locations.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {company.locations.slice(0, 3).map((l) => (
              <span key={l} className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-sm text-zinc-700">{l}</span>
            ))}
          </div>
        )}
      </section>

      {/* Jobs */}
      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-title text-lg font-semibold text-zinc-900">Jobs</h2>
          <div className="font-body text-sm text-zinc-600">{jobs.length} open</div>
        </div>
        {jobs.length === 0 ? (
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-center text-zinc-600">No active listings</div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <Link key={job.id} href={{ pathname: "/job-search", query: { selected: job.id } }} className="block rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition-all hover:border-zinc-300 hover:bg-zinc-50 hover:shadow-md">
                <div className="flex items-start gap-4">
                  <FaviconImage src={job.companyImageUrl} company={job.company} />
                  <div className="min-w-0">
                    <div className="font-body text-sm text-zinc-600">{job.company}</div>
                    <div className="font-title text-lg font-semibold text-zinc-900">{job.position}</div>
                    <div className="font-body text-[15px] text-zinc-700">
                      {job.salaryMin && job.salaryMax ? `${job.salaryMin} - ${job.salaryMax} · ` : ""}
                      {formatEmploymentType(job.employmentType)}
                    </div>
                    <div className="font-body text-sm text-zinc-500 mt-1">{job.location} · {timeAgo(job.createdAt)}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* People */}
      <section className="mt-10">
        <h2 className="mb-3 font-title text-lg font-semibold text-zinc-900">People</h2>
        {people.length === 0 ? (
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-center text-zinc-600">No people listed</div>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {people.map((p) => (
              <li key={p.id} className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900 text-white text-sm font-medium">
                  {initials((p.name || p.email || "U") as string)}
                </div>
                <div>
                  <div className="font-body text-[15px] text-zinc-900">{p.name}</div>
                  {p.email ? (
                    <div className="font-body text-sm text-zinc-600">{p.email}</div>
                  ) : p.url ? (
                    <a href={p.url} target="_blank" rel="noopener noreferrer" className="font-body text-sm text-zinc-600 underline">Profile</a>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}

function initials(nameOrEmail: string) {
  const s = nameOrEmail.trim();
  if (!s.includes(" ")) return s.slice(0, 2).toUpperCase();
  const parts = s.split(/\s+/);
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function CompanySkeleton() {
  return (
    <div>
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-zinc-200" />
          <div className="space-y-2">
            <div className="h-6 w-40 bg-zinc-200 rounded" />
            <div className="h-4 w-32 bg-zinc-200 rounded" />
          </div>
        </div>
      </div>
      <div className="mt-8 space-y-3">
        <div className="h-5 w-24 bg-zinc-200 rounded" />
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="h-5 w-48 bg-zinc-200 rounded" />
        </div>
      </div>
    </div>
  );
}
