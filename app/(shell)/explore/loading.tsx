import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import GridOverlay from "@/components/ui/GridOverlay";

export default function Loading() {
  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* Background image + gradient, matching home/explore */}
      <Image
        src="/goosephoto.png"
        alt="Waterloo building illustration"
        fill
        priority
        className="absolute inset-0 z-0 object-cover opacity-60"
      />
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-slate-900/50 via-slate-900/70 to-black/90" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 md:h-48 z-10 bg-gradient-to-b from-white/30 via-white/10 to-transparent" />
      <div className="absolute inset-0 z-[12] pointer-events-none overflow-hidden">
        <div className="ww-shimmer ww-shimmer--force" style={{ ['--shimmer-duration' as any]: '7.5s', ['--shimmer-rot' as any]: '-12deg' }} />
        <div className="ww-shimmer ww-shimmer--force" style={{ ['--shimmer-duration' as any]: '11s', opacity: 0.35, ['--shimmer-ty' as any]: '18%', ['--shimmer-rot' as any]: '-8deg' }} />
      </div>
      <GridOverlay
        className="z-20"
        fullHeight
        variant="sides"
        showTopTicks
        showBottomTicks
        showNodes
        showBottomNodes
        style={{ ['--ticks-top-offset' as any]: '66px', ['--hairline-top' as any]: '64px', ['--hairline-bottom' as any]: '8px' }}
      />

      {/* Skeleton content */}
      <div className="relative z-30 mx-auto max-w-6xl px-8 py-14">
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
    </section>
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
