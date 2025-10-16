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
            style={{ ['--ticks-top-offset' as any]: '66px', ['--hairline-top' as any]: '64px' }}
          />

          {/* Layer 3: Content */}
          <div className="relative z-30 mx-auto max-w-4xl px-6 py-20 md:py-32">
            <h2 className="font-header text-h2 tracking-tight-04 leading-heading mb-2 text-zinc-50">
              Curated opportunities for alum
            </h2>

            <p className="font-body tracking-wide-01 leading-body mt-2 md:mt-3 mb-8 md:mb-10 max-w-3xl text-zinc-200 text-lg md:text-xl">
              Alum can post opportunities, apply, or forward roles to people who actually want them.
            </p>

            {/* Choice cards */}
            <div className="mt-12 grid gap-5 md:grid-cols-2">
              <Link href="/explore" className="group">
                <div className="rounded-2xl border border-zinc-200/70 bg-white/80 p-8 backdrop-blur-sm transition-colors hover:bg-white">
                  <p className="font-body tracking-wide-01 leading-body text-sm text-zinc-600">Alum</p>
                  <h3 className="font-header text-h3 tracking-tight-02 leading-heading mt-2 text-zinc-900">Find your next job</h3>
                  <span className="ds-chip mt-6 gap-2 group-hover:bg-zinc-50">
                    <span>↗</span>
                    <span>Explore jobs</span>
                  </span>
                </div>
              </Link>

              <Link href="/post-job" className="group">
                <div className="rounded-2xl border border-zinc-200/70 bg-white/80 p-8 backdrop-blur-sm transition-colors hover:bg-white">
                  <p className="font-body tracking-wide-01 leading-body text-sm text-zinc-600">Employers</p>
                  <h3 className="font-header text-h3 tracking-tight-02 leading-heading mt-2 text-zinc-900">Hire top talent</h3>
                  <span className="ds-chip mt-6 gap-2 group-hover:bg-zinc-50">
                    <span>✏️</span>
                    <span>Post a job</span>
                  </span>
                </div>
              </Link>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-6 py-16 md:py-24 space-y-10">
          <h3 className="font-header text-h3 tracking-tight-02 leading-heading text-zinc-900">How it works</h3>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="ds-card">
              <h3 className="font-header text-h3 tracking-tight-02 leading-heading text-zinc-900">Discover</h3>
              <p className="font-body tracking-wide-01 leading-body mt-2 text-zinc-700">Browse jobs posted by other alum.</p>
            </div>
            <div className="ds-card">
              <h3 className="font-header text-h3 tracking-tight-02 leading-heading text-zinc-900">Apply</h3>
              <p className="font-body tracking-wide-01 leading-body mt-2 text-zinc-700">See a fit? Click apply.</p>
            </div>
            <div className="ds-card">
              <h3 className="font-header text-h3 tracking-tight-02 leading-heading text-zinc-900">Share</h3>
              <p className="font-body tracking-wide-01 leading-body mt-2 text-zinc-700">Forward roles to people you know who’d want them.</p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
