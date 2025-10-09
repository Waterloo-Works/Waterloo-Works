export default function ShellLoading() {
  return (
    <div className="mx-auto max-w-6xl px-8 py-14">
      <div className="mb-10 h-8 w-40 animate-pulse rounded bg-zinc-200" />
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="animate-pulse rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-zinc-200" />
              <div className="flex-1 space-y-2">
                <div className="h-5 w-1/2 rounded bg-zinc-200" />
                <div className="h-4 w-1/3 rounded bg-zinc-200" />
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <div className="h-6 w-20 rounded-full bg-zinc-200" />
              <div className="h-6 w-16 rounded-full bg-zinc-200" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

