import Link from "next/link";

// Minimal footer with a single external link

export default function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-10">
        <p className="font-body text-sm text-zinc-600">
          Made with 💦 by{" "}
          <Link
            href="https://waterloogroup.chat"
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-900 underline hover:opacity-80"
          >
            waterloogroup.chat
          </Link>{" "}
          
        </p>
        <div className="flex items-center gap-4" />
      </div>
    </footer>
  );
}
