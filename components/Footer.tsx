import Link from "next/link";

type Props = {
  tone?: "light" | "dark";
};

export default function Footer({ tone = "light" }: Props) {
  // Lean, single-row footer with subtle separators.
  const links = [
    { href: "/companies", label: "Companies" },
    { href: "/post-job", label: "Post a Job" },
  ];

  const isDark = tone === "dark";
  const footerClass = isDark
    ? "border-border bg-background backdrop-blur-sm relative overflow-visible"
    : "border-border bg-card";
  const linkClass = isDark
    ? "text-foreground/80 hover:text-foreground"
    : "text-muted-foreground hover:text-foreground";
  const dotClass = isDark ? "text-foreground/30" : "text-muted-foreground/50";

  return (
    <footer className={`border-t ${footerClass}`}>
      {isDark && (
        <>
          {/* Blend into hero */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-6 bg-gradient-to-t from-background to-transparent z-0" />
          {/* Borrow the top candle markers, positioned ABOVE the footer edge */}
          <div className="pointer-events-none absolute inset-x-0 -top-5 h-6 z-30">
            <div className="grid-overlay-ticks h-full opacity-80" style={{ ['--ticks-top-offset' as any]: '0px' }} />
          </div>
          {/* Circular nodes at rail intersections on the footer edge */}
          <div className="pointer-events-none absolute inset-x-0 -top-5 h-10 z-30">
            <div className="grid-overlay-nodes" style={{ ['--hairline-top' as any]: '9px' }} />
          </div>
          {/* Rails continue through footer (above footer content) */}
          <div className="pointer-events-none absolute inset-0 z-10">
            <div className="grid-overlay-sides h-full opacity-60" />
          </div>
        </>
      )}
      <div className="relative mx-auto max-w-6xl px-6 py-6">
        <nav aria-label="Footer" className={`flex flex-wrap items-center gap-x-4 gap-y-2 text-sm ${isDark ? 'text-foreground/80' : 'text-muted-foreground'}`}>
          {links.map((item, idx) => (
            <span key={item.href} className="flex items-center">
              {idx > 0 && <span className={`mx-2 ${dotClass}`}>·</span>}
              <Link href={item.href} className={`${linkClass} transition-colors`}>
                {item.label}
              </Link>
            </span>
          ))}
          {/* External: GitHub repo */}
          <span className="flex items-center">
            <span className={`mx-2 ${dotClass}`}>·</span>
            <a
              href="https://github.com/Waterloo-Works"
              target="_blank"
              rel="noopener noreferrer"
              className={`${linkClass} transition-colors`}
            >
              GitHub
            </a>
          </span>
        </nav>
      </div>
    </footer>
  );
}
