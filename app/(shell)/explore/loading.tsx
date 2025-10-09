import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-8 py-14">
      <div className="space-y-10">
        <div className="space-y-4">
          <Skeleton className="h-7 w-72 rounded-md" />
          <div className="grid items-stretch gap-7 lg:grid-cols-2 xl:grid-cols-3">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton className="hidden lg:block" />
          </div>
        </div>

        <div className="space-y-4">
          <Skeleton className="h-7 w-[28rem] rounded-md" />
          <div className="grid items-stretch gap-7 lg:grid-cols-2 xl:grid-cols-3">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton className="hidden lg:block" />
          </div>
        </div>
      </div>
    </div>
  );
}

function CardSkeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`flex h-full flex-col justify-between rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm ${className}`}>
      <div className="flex items-start gap-4">
        <Skeleton className="h-10 w-10 rounded-md" />
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-5 w-4/5" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
    </div>
  );
}

