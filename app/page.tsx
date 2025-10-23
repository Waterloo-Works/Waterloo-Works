import Link from "next/link";
import Image from "next/image";
import GridOverlay from "@/components/ui/GridOverlay";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Footer from "@/components/Footer";
import HeaderLanding from "@/components/HeaderLanding";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) redirect("/explore");

  return (
    <div className="dark min-h-screen bg-black">

      <main>
      <HeaderLanding />
        {/* Hero: layered background (image + gradient) with centered content */}
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

          {/* Layer 2.5: Top lightening wash to lift contrast near the header */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-40 md:h-48 z-10 bg-gradient-to-b from-white/30 via-white/10 to-transparent" />

          {/* Pendulum shimmer (loops) under grid; pivot at top for stronger bottom motion */}
          <div className="absolute inset-0 z-[12] pointer-events-none overflow-hidden">
            <div className="ww-pendulum ww-pendulum--force ww-pendulum--flip" style={{ ['--pendulum-duration' as any]: '9s', opacity: 0.45 }} />
            <div className="ww-pendulum ww-pendulum--force ww-pendulum--flip" style={{ ['--pendulum-duration' as any]: '13s', opacity: 0.25, ['--pendulum-from' as any]: '-12deg', ['--pendulum-to' as any]: '12deg' }} />
          </div>

          {/* Decorative side rails only, to frame content */}
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

          {/* Layer 3: Content */}
          <div className="relative z-30 mx-auto flex min-h-svh max-w-4xl flex-col items-center justify-center px-4 md:px-6 text-center">
            <h2 className="font-header text-[2.25rem] md:text-h2 tracking-tight-04 leading-heading mb-3 text-white">
              Starting with UWaterloo, we&apos;re building an open source marketplace to match cracked Canadian youth with companies who believe in them, ready to match their ambition.
            </h2>

            {/* Single CTA pill — responsive sizes, no card behind */}
            <div className="w-full flex items-center justify-center mt-8 md:mt-10">
              <Link
                href="/explore"
                className="rounded-full bg-primary text-primary-foreground px-5 py-2 text-sm shadow hover:bg-primary/90 md:px-8 md:py-4 md:text-lg"
              >
                Explore jobs.
              </Link>
            </div>
          </div>
        </section>

       
      </main>
      <Footer tone="dark" />
    </div>
  );
}
