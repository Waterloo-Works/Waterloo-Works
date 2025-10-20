import Link from "next/link";
import Image from "next/image";
import GridOverlay from "@/components/ui/GridOverlay";
import LoginClient from "./pageClient";

export default async function LoginPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header over hero background (same as home) */}
      <header className="absolute inset-x-0 top-0 z-40 flex h-16 items-center justify-between px-6 border-b border-white/20 bg-transparent">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between">
          <Link href="/" className="text-xl font-header italic text-zinc-50">
            waterloo.app
          </Link>
        </div>
      </header>

      <main>
        {/* Hero background copied from home */}
        <section className="relative min-h-screen overflow-hidden">
          {/* Layer 1: Background image */}
          <Image
            src="/hero.png"
            alt="Waterloo goose illustration background"
            fill
            priority
            className="absolute inset-0 z-0 object-cover opacity-60"
          />
          {/* Layer 2: Gradient overlay (mid → dark) */}
          <div className="absolute inset-0 z-0 bg-gradient-to-b from-slate-900/50 via-slate-900/70 to-black/90" />

          {/* Top lightening wash */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-40 md:h-48 z-10 bg-gradient-to-b from-white/30 via-white/10 to-transparent" />

          {/* Subtle shimmer motion */}
          <div className="absolute inset-0 z-[12] pointer-events-none overflow-hidden">
            <div className="ww-shimmer ww-shimmer--force" style={{ ['--shimmer-duration' as any]: '7.5s', ['--shimmer-rot' as any]: '-12deg' }} />
            <div className="ww-shimmer ww-shimmer--force" style={{ ['--shimmer-duration' as any]: '11s', opacity: 0.35, ['--shimmer-ty' as any]: '18%', ['--shimmer-rot' as any]: '-8deg' }} />
          </div>

          {/* Decorative side rails */}
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

          {/* Content: centered auth card */}
          <div className="relative z-30 mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-6">
            <div className="w-full max-w-md">
              <LoginClient />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
