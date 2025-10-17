import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import GridOverlay from "@/components/ui/GridOverlay";

export default function Loading() {
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

     
    </section>
  );
}
