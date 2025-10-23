import Link from "next/link";

type Props = {
  tone?: "light" | "dark";
};

export default function Footer({ tone = "light" }: Props) {
  // Organized footer: CTAs on left, social links on right, policies below
  const ctaLinks = [
    { href: "/companies", label: "Companies" },
    { href: "/post-job", label: "Post a Job" },
  ];

  const socialLinks = [
    { href: "https://github.com/Waterloo-Works", label: "GitHub", external: true },
    { href: "https://discord.gg/nZnqjzrp", label: "Discord", external: true },
  ];

  const policyLinks = [
    { href: "/privacy", label: "Privacy" },
    { href: "/terms", label: "Terms" },
  ];

  const isDark = tone === "dark";
  const footerClass = isDark
    ? "border-border bg-background backdrop-blur-sm relative overflow-visible"
    : "border-border bg-card";
  const linkClass = isDark
    ? "text-foreground/80 hover:text-foreground"
    : "text-muted-foreground hover:text-foreground";
  const dotClass = isDark ? "text-foreground/30" : "text-muted-foreground/50";
  const policyClass = isDark ? "text-foreground/50 hover:text-foreground/70" : "text-muted-foreground/60 hover:text-muted-foreground";

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
        {/* Main footer row: CTAs left, Social links right */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Left: CTA Links */}
          <nav aria-label="Footer CTA" className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
            {ctaLinks.map((item, idx) => (
              <span key={item.href} className="flex items-center">
                {idx > 0 && <span className={`mx-2 ${dotClass}`}>·</span>}
                <Link href={item.href} className={`${linkClass} transition-colors`}>
                  {item.label}
                </Link>
              </span>
            ))}
          </nav>

          {/* Right: Social Links */}
          <nav aria-label="Footer Social" className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
            {socialLinks.map((item, idx) => (
              <span key={item.href} className="flex items-center">
                {idx > 0 && <span className={`mx-2 ${dotClass}`}>·</span>}
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${linkClass} transition-colors`}
                >
                  {item.label}
                </a>
              </span>
            ))}
          </nav>
        </div>

        {/* Policy links - smaller, less prominent, below main links */}
        <nav aria-label="Footer Policies" className="mt-4 flex flex-wrap items-center gap-x-3 text-xs">
          {policyLinks.map((item, idx) => (
            <span key={item.href} className="flex items-center">
              {idx > 0 && <span className={`mx-2 ${dotClass}`}>·</span>}
              <Link href={item.href} className={`${policyClass} transition-colors`}>
                {item.label}
              </Link>
            </span>
          ))}
        </nav>
      </div>
    </footer>
  );
}
