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
          <Link href="/" className="text-xl font-serif italic text-zinc-900">
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
        <h1 className="mb-2 font-title text-4xl font-semibold tracking-tight text-zinc-900 md:text-5xl">
          Curated opportunities for alum
        </h1>
        
        <p className="font-body text-lg text-zinc-700 md:text-xl mt-2 md:mt-3 mb-8 md:mb-10 leading-7 md:leading-8 max-w-3xl">
          Alum can post opportunities, apply, or forward roles to people who actually want them.
        </p>

        {/* Junh-style choice cards */}
        <section className="mt-12">
          <div className="grid gap-5 md:grid-cols-2">
            <Link
              href="/explore"
              className="group rounded-3xl bg-zinc-50 text-zinc-900 p-8 sm:p-10 shadow-sm ring-1 ring-zinc-200 transition-all hover:-translate-y-0.5 hover:shadow-md hover:bg-zinc-100"
            >
              <div className="font-body text-sm/6 text-zinc-600">Alum</div>
              <div className="mt-2 font-title text-2xl sm:text-3xl font-semibold tracking-tight">
                Find your next job
              </div>
              <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm text-zinc-800 ring-1 ring-zinc-200 group-hover:bg-zinc-50">
                <span>↗</span>
                <span>Explore jobs</span>
              </div>
            </Link>

            <Link
              href="/post-job"
              className="group rounded-3xl bg-zinc-50 text-zinc-900 p-8 sm:p-10 shadow-sm ring-1 ring-zinc-200 transition-all hover:-translate-y-0.5 hover:shadow-md hover:bg-zinc-100"
            >
              <div className="font-body text-sm/6 text-zinc-600">Employers</div>
              <div className="mt-2 font-title text-2xl sm:text-3xl font-semibold tracking-tight">
                Hire top talent
              </div>
              <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm text-zinc-800 ring-1 ring-zinc-200 group-hover:bg-zinc-50">
                <span>✏️</span>
                <span>Post a job</span>
              </div>
            </Link>
          </div>
        </section>

        <section className="mt-24 space-y-10">
          <h2 className="font-title text-2xl font-semibold text-zinc-900">How it works</h2>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition-all hover:border-zinc-300 hover:bg-zinc-50 hover:shadow-md focus-within:ring-1 focus-within:ring-zinc-300">
              <h3 className="font-title text-lg font-semibold text-zinc-900">Discover</h3>
              <p className="font-body mt-2 text-zinc-700">
                Browse jobs posted by other alum.
              </p>
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition-all hover:border-zinc-300 hover:bg-zinc-50 hover:shadow-md focus-within:ring-1 focus-within:ring-zinc-300">
              <h3 className="font-title text-lg font-semibold text-zinc-900">Apply</h3>
              <p className="font-body mt-2 text-zinc-700">See a fit? Click apply.</p>
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition-all hover:border-zinc-300 hover:bg-zinc-50 hover:shadow-md focus-within:ring-1 focus-within:ring-zinc-300">
              <h3 className="font-title text-lg font-semibold text-zinc-900">Share</h3>
              <p className="font-body mt-2 text-zinc-700">
                Forward roles to people you know who’d want them.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
