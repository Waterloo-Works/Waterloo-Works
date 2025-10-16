import Link from "next/link";

export default function Footer() {
  // Lean, single-row footer with subtle separators.
  const links = [
    { href: "/jobs", label: "Jobs" },
    { href: "/companies", label: "Companies" },
    { href: "/resources", label: "Resources" },
    { href: "/explore", label: "Explore" },
    { href: "/post-job", label: "Post a Job" },
    { href: "/terms", label: "Terms" },
    { href: "/privacy", label: "Privacy" },
  ];

  return (
    <footer className="border-t border-zinc-200 bg-white">
      <div className="mx-auto max-w-6xl px-6 py-6">
        <nav aria-label="Footer" className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-zinc-600">
          {links.map((item, idx) => (
            <span key={item.href} className="flex items-center">
              {idx > 0 && <span className="mx-2 text-zinc-300">·</span>}
              <Link href={item.href} className="hover:text-zinc-900 transition-colors">
                {item.label}
              </Link>
            </span>
          ))}
        </nav>
      </div>
    </footer>
  );
}
