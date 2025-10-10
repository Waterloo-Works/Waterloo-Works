import Link from "next/link";
import { Suspense } from "react";
import PageHeaderPortal from "@/components/PageHeaderPortal";
import { getCompanies } from "@/app/actions/companies";
import FaviconImage from "@/components/FaviconImage";

export const metadata = { title: "Employers" };

export default async function EmployersIndexPage() {
  return (
    <div className="mx-auto max-w-6xl px-8 py-14">
      <PageHeaderPortal>
        <h1 className="text-xl font-semibold tracking-tight text-zinc-900">Employers</h1>
      </PageHeaderPortal>
      <h1 className="mb-10 text-3xl font-semibold tracking-tight text-zinc-900 md:hidden">Employers</h1>
      <Suspense fallback={<EmployersSkeleton />}> 
        <EmployersList />
      </Suspense>
    </div>
  );
}

async function EmployersList() {
  const companies = await getCompanies();
  if (companies.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="inline-block h-16 w-16 rounded-full bg-zinc-100 mb-4" />
        <h3 className="font-title text-xl text-zinc-900 mb-2">No companies yet</h3>
        <p className="font-body text-zinc-600">Companies will appear as jobs are posted.</p>
      </div>
    );
  }
  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {companies.map((c) => (
        <Link key={c.slug} href={`/employers/${c.slug}`} className="block group rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition-all hover:border-zinc-300 hover:bg-zinc-50 hover:shadow-md">
          <div className="flex items-center gap-3">
            <FaviconImage src={c.logoUrl || null} company={c.name} />
            <div className="min-w-0">
              <div className="font-title text-[16px] font-semibold text-zinc-900 group-hover:underline">{c.name}</div>
              <div className="font-body text-sm text-zinc-600 truncate">{c.domain || c.website || "—"}</div>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {c.locations.slice(0, 3).map((l) => (
              <span key={l} className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-sm text-zinc-700">{l}</span>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between font-body text-sm text-zinc-700">
            <span>{c.jobsCount} job{c.jobsCount === 1 ? "" : "s"}</span>
            <span className="text-zinc-900">View company →</span>
          </div>
        </Link>
      ))}
    </div>
  );
}

function EmployersSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="animate-pulse rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-zinc-200" />
            <div className="flex-1 space-y-2">
              <div className="h-5 w-1/2 bg-zinc-200 rounded" />
              <div className="h-4 w-1/3 bg-zinc-200 rounded" />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <div className="h-6 w-20 rounded-full bg-zinc-200" />
            <div className="h-6 w-16 rounded-full bg-zinc-200" />
          </div>
          <div className="mt-4 h-4 w-1/3 bg-zinc-200 rounded" />
        </div>
      ))}
    </div>
  );
}
