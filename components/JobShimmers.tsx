"use client";

export function JobGridShimmer({ count = 6 }: { count?: number }) {
  return (
    <div className="hidden md:grid items-stretch gap-7 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="h-4 w-1/3 rounded bg-primary/10 animate-pulse" />
          <div className="mt-3 h-6 w-3/4 rounded bg-primary/10 animate-pulse" />
          <div className="mt-2 h-4 w-1/2 rounded bg-primary/10 animate-pulse" />
          <div className="mt-4 h-4 w-2/3 rounded bg-primary/10 animate-pulse" />
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
            <div className="h-10 w-10 rounded-md bg-primary/10 animate-pulse" />
            <div className="min-w-0 flex-1">
              <div className="h-5 w-3/4 rounded bg-primary/10 animate-pulse" />
              <div className="mt-2 h-4 w-1/2 rounded bg-primary/10 animate-pulse" />
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

