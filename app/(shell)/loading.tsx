import Image from "next/image";
import GridOverlay from "@/components/ui/GridOverlay";

export default function ShellLoading() {
  return (
    <section className="relative min-h-screen overflow-hidden">
      <Image
        src="/hero.png"
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

      <div className="relative z-30 mx-auto max-w-6xl px-8 py-14">
        <div className="mb-10 h-8 w-40 animate-pulse rounded bg-zinc-200" />
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-2xl border border-zinc-200 bg-white/90 backdrop-blur-sm p-6 shadow-sm">
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
    </section>
  );
}
