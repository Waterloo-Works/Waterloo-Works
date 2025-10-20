import Link from "next/link";

export default function HeaderLanding() {
  return (
    <header className="absolute inset-x-0 top-0 z-40 flex h-16 md:h-20 items-center justify-between px-4 md:px-6">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between">
        <Link href="/" className="text-xl font-header italic text-white/95 transition-opacity hover:opacity-70">
          waterloo.app
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="rounded-full bg-white/10 backdrop-blur-md px-4 py-2 text-sm text-white border border-white/20 shadow-sm hover:bg-white/15 hover:border-white/30 transition-all"
          >
            Sign in
          </Link>
        </div>
      </div>
    </header>
  );
}
