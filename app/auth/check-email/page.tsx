import Link from "next/link";

export default function CheckEmailPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header consistent with home/login */}
      <header className="px-6 py-5 border-b border-zinc-200">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link href="/" className="text-xl font-serif italic text-zinc-900">
            waterloo[dot]works
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-6xl px-6 py-16 md:py-20">
        <div className="mx-auto w-full max-w-md rounded-3xl bg-white p-8 shadow-sm ring-1 ring-zinc-200 text-center">
          <h1 className="font-title text-3xl md:text-4xl font-semibold text-zinc-900 mb-2">Check your email</h1>
          <p className="font-body text-zinc-700">
            We sent you a magic link to sign in. Open your inbox and click the link to continue.
          </p>
          <div className="mt-6 text-sm text-zinc-500 font-body">Didn’t get it? It can take a minute. Also check spam.</div>
        </div>
      </main>
    </div>
  );
}
