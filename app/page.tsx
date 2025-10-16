import Link from "next/link";
import Image from "next/image";
import GridOverlay from "@/components/ui/GridOverlay";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Footer from "@/components/Footer";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) redirect("/explore");

  return (
    <div className="min-h-screen bg-white">
      <header className="absolute inset-x-0 top-0 z-40 flex h-16 items-center justify-between px-6 border-b border-white/20 bg-transparent">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between">
          <Link href="/" className="text-xl font-header italic text-zinc-50">
            waterloo.works
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-full bg-zinc-900/90 px-4 py-2 text-sm text-white shadow-sm ring-1 ring-white/10 backdrop-blur hover:bg-zinc-900"
            >
              Sign in
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero: layered background (image + gradient) with centered content */}
        <section className="relative min-h-screen overflow-hidden">
          {/* Layer 1: Background image */}
          <Image
            src="/goosephoto.png"
            alt="Waterloo goose illustration background"
            fill
            priority
            className="absolute inset-0 z-0 object-cover opacity-60"
          />
          {/* Layer 2: Gradient overlay (mid → dark) */}
          <div className="absolute inset-0 z-0 bg-gradient-to-b from-slate-900/50 via-slate-900/70 to-black/90" />

          {/* Layer 2.5: Top lightening wash to lift contrast near the header */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-40 md:h-48 z-10 bg-gradient-to-b from-white/30 via-white/10 to-transparent" />

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
          <div className="relative z-30 mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center px-6 text-center">
            <h2 className="font-header text-h2 tracking-tight-04 leading-heading mb-3 text-zinc-50">
              Curated opportunities for alum
            </h2>

            <p className="font-body tracking-wide-01 leading-body mt-2 md:mt-3 mb-10 max-w-2xl text-zinc-200 text-lg md:text-xl">
              Alum can post opportunities, apply, or forward roles to people who actually want them.
            </p>

            {/* Choice cards */}
            <div className="grid w-full max-w-2xl gap-5 md:grid-cols-2">
              <Link href="/explore" className="group">
                <div className="ds-card-washi ds-cta-card h-[300px] md:h-[320px] flex flex-col items-center justify-between focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60">
                  <p className="font-body tracking-wide-01 leading-body text-sm text-zinc-700">Alum</p>
                  <h3 className="font-header text-h3 tracking-tight-02 leading-heading text-zinc-900">Find your next job</h3>
                  <span className="ds-chip gap-2 hover:bg-white/90">
                    <span className="transition-transform duration-300 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5">↗</span>
                    <span>Explore jobs</span>
                  </span>
                </div>
              </Link>

              <Link href="/post-job" className="group">
                <div className="ds-card-washi ds-cta-card h-[300px] md:h-[320px] flex flex-col items-center justify-between focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60">
                  <p className="font-body tracking-wide-01 leading-body text-sm text-zinc-700">Employers</p>
                  <h3 className="font-header text-h3 tracking-tight-02 leading-heading text-zinc-900">Hire top talent</h3>
                  <span className="ds-chip gap-2 hover:bg-white/90">
                    <span className="transition-transform duration-300 ease-out group-hover:-translate-y-0.5">✏️</span>
                    <span>Post a job</span>
                  </span>
                </div>
              </Link>
            </div>
          </div>
        </section>

       
      </main>
      <Footer />
    </div>
  );
}
