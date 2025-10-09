export default function RootLoading() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="mb-8 h-9 w-48 animate-pulse rounded bg-zinc-200" />
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="animate-pulse rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="h-5 w-1/2 rounded bg-zinc-200" />
            <div className="mt-2 h-4 w-1/3 rounded bg-zinc-200" />
          </div>
        ))}
      </div>
    </div>
  );
}

