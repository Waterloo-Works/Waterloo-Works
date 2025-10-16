import Link from "next/link";
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
      <header className="px-6 py-5 border-b border-zinc-200">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link href="/" className="text-xl font-header italic text-zinc-900">
            waterloo.works
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-full bg-zinc-900 px-4 py-2 text-sm text-white hover:bg-zinc-800"
            >
              Sign in
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-20 md:py-28">
        <h2 className="font-header text-h2 tracking-tight-04 leading-heading mb-2 text-zinc-900">
          Curated opportunities for alum
        </h2>

        <p className="font-body tracking-wide-01 leading-body mt-2 md:mt-3 mb-8 md:mb-10 max-w-3xl text-zinc-700 text-lg md:text-xl">
          Alum can post opportunities, apply, or forward roles to people who actually want them.
        </p>

        {/* Junh-style choice cards */}
        <section className="mt-12">
          <div className="grid gap-5 md:grid-cols-2">
            <Link href="/explore" className="group">
              <div className="ds-card p-8 sm:p-10">
                <p className="font-body tracking-wide-01 leading-body text-sm text-zinc-600">Alum</p>
                <h3 className="font-header text-h3 tracking-tight-02 leading-heading mt-2 text-zinc-900">Find your next job</h3>
                <span className="ds-chip mt-6 gap-2 group-hover:bg-zinc-50">
                  <span>↗</span>
                  <span>Explore jobs</span>
                </span>
              </div>
            </Link>

            <Link href="/post-job" className="group">
              <div className="ds-card p-8 sm:p-10">
                <p className="font-body tracking-wide-01 leading-body text-sm text-zinc-600">Employers</p>
                <h3 className="font-header text-h3 tracking-tight-02 leading-heading mt-2 text-zinc-900">Hire top talent</h3>
                <span className="ds-chip mt-6 gap-2 group-hover:bg-zinc-50">
                  <span>✏️</span>
                  <span>Post a job</span>
                </span>
              </div>
            </Link>
          </div>
        </section>

        <section className="mt-24 space-y-10">
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
