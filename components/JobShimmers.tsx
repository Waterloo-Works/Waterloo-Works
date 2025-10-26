"use client";

export function JobGridShimmer({ count = 6 }: { count?: number }) {
  return (
    <div className="hidden md:grid items-stretch gap-7 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="shimmer h-4 w-1/3 rounded" />
          <div className="mt-3 shimmer h-6 w-3/4 rounded" />
          <div className="mt-2 shimmer h-4 w-1/2 rounded" />
          <div className="mt-4 shimmer h-4 w-2/3 rounded" />
        </div>
      ))}
    </div>
  );
}

export function JobListShimmer({ count = 4 }: { count?: number }) {
  return (
    <div className="md:hidden space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="flex gap-3">
            <div className="shimmer h-10 w-10 rounded-md" />
            <div className="min-w-0 flex-1">
              <div className="shimmer h-5 w-3/4 rounded" />
              <div className="mt-2 shimmer h-4 w-1/2 rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function SectionShimmer() {
  return (
    <div className="space-y-4">
      <JobGridShimmer count={6} />
      <JobListShimmer count={4} />
    </div>
  );
}

