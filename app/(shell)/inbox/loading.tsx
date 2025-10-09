import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-8 py-14">
      <Skeleton className="mb-6 h-8 w-32" />
      <div className="space-y-3">
        {[0,1,2,3].map((i) => (
          <div key={i} className="rounded-2xl border border-zinc-200 bg-white p-4">
            <div className="flex items-start gap-3">
              <Skeleton className="h-5 w-40" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

