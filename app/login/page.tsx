import Link from "next/link";
import { getAuthVariant } from "@/lib/exp/flags";
import LoginClient from "./pageClient";

export default async function LoginPage() {
  const variant = await getAuthVariant();
  return (
    <div className="min-h-screen bg-white">
      {/* Header consistent with home */}
      <header className="px-6 py-5 border-b border-zinc-200">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link href="/" className="text-xl font-serif italic text-zinc-900">
            waterloo[dot]works
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-6xl px-6 py-16 md:py-20">
        <div className="mx-auto w-full max-w-md">
          <LoginClient variant={variant} />
        </div>
      </main>
    </div>
  );
}
