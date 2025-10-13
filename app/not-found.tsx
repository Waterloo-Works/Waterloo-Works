import Link from "next/link";
import HeaderMinimal from "@/components/HeaderMinimal";

export const metadata = { title: "Not Found" };
export const dynamic = "force-dynamic";

export default function NotFound() {
  return (
    <div className="min-h-svh bg-white">
      <HeaderMinimal />
      <main className="mx-auto max-w-3xl px-6 py-20 text-center">
        <div className="mx-auto mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100" />
        <h1 className="font-title text-3xl md:text-4xl font-semibold tracking-tight text-zinc-900">
          Page not found
        </h1>
        <p className="font-body mx-auto mt-3 max-w-xl text-zinc-600">
          The page you’re looking for doesn’t exist or may have moved.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link
            href="/explore"
            className="rounded-full bg-zinc-900 px-5 py-2.5 text-white hover:bg-zinc-800"
          >
            Explore jobs
          </Link>
          <Link
            href="/"
            className="rounded-full border border-zinc-200 bg-white px-5 py-2.5 text-zinc-800 hover:bg-zinc-50"
          >
            Home
          </Link>
        </div>
      </main>
    </div>
  );
}

