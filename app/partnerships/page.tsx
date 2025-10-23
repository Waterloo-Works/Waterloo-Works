import Image from "next/image";
import { fetchCompanyMetadata } from "@/app/actions/company-metadata";
import Link from "next/link";
import GridOverlay from "@/components/ui/GridOverlay";

export const metadata = { title: "Partnership Opportunities" };

export default async function PartnershipsPage({
  searchParams,
}: {
  searchParams: Promise<{ url?: string }>;
}) {
  const params = await searchParams;
  const companyUrl = params.url;

  let companyData: {
    name: string;
    logo: string;
    description: string;
    url: string;
  } | null = null;

  if (companyUrl) {
    const result = await fetchCompanyMetadata(companyUrl);
    if (result.success && result.data) {
      companyData = result.data;
    }
  }

  const companyName = companyData?.name || "[Company Name]";
  const companyLogo = companyData?.logo;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section with Background */}
      <section className="relative min-h-[60vh] md:min-h-[70vh] overflow-hidden bg-black">
        {/* Layer 1: Background image */}
        <Image
          src="/hero.png"
          alt="Waterloo partnership background"
          fill
          priority
          className="absolute inset-0 z-0 object-cover opacity-60"
        />
        {/* Layer 2: Gradient overlay (mid → dark) */}
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-slate-900/50 via-slate-900/70 to-black/90" />

        {/* Layer 2.5: Top lightening wash */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-40 md:h-48 z-10 bg-gradient-to-b from-white/30 via-white/10 to-transparent" />

        {/* Pendulum shimmer effects */}
        <div className="absolute inset-0 z-[12] pointer-events-none overflow-hidden">
          <div className="ww-pendulum ww-pendulum--force ww-pendulum--flip" style={{ ['--pendulum-duration' as any]: '9s', opacity: 0.45 }} />
          <div className="ww-pendulum ww-pendulum--force ww-pendulum--flip" style={{ ['--pendulum-duration' as any]: '13s', opacity: 0.25, ['--pendulum-from' as any]: '-12deg', ['--pendulum-to' as any]: '12deg' }} />
        </div>

        {/* Decorative side rails */}
        <GridOverlay
          className="z-20"
          fullHeight
          variant="sides"
          showTopTicks
          showBottomTicks
          showNodes
          showBottomNodes
          style={{ ['--ticks-top-offset' as any]: '66px', ['--hairline-top' as any]: '64px', ['--hairline-bottom' as any]: '8px' }}
        />

        {/* Layer 3: Content */}
        <div className="relative z-30 mx-auto max-w-4xl px-4 md:px-8 py-16 md:py-24 text-center">
          {/* Header with handshake visual */}
          <div className="mb-8 flex items-center justify-center gap-4 md:gap-6">
            {companyLogo && (
              <div className="relative h-20 w-20 md:h-24 md:w-24 rounded-2xl overflow-hidden border border-white/20 bg-white shadow-2xl flex items-center justify-center p-3">
                <Image
                  src={companyLogo}
                  alt={`${companyName} logo`}
                  fill
                  className="object-contain p-3"
                  unoptimized
                />
              </div>
            )}
            <div className="text-5xl md:text-6xl">🤝</div>
            <div className="relative h-20 w-20 md:h-24 md:w-24 flex items-center justify-center rounded-2xl border border-white/20 bg-white shadow-2xl">
              <span className="font-header text-2xl md:text-3xl italic text-zinc-900">waterloo</span>
            </div>
          </div>

          <h1 className="font-header text-3xl md:text-4xl font-semibold text-white mb-4">
            Welcome to waterloo.app, {companyName}
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
            Starting with UWaterloo, we&apos;re building an open source marketplace to match cracked Canadian youth with tech companies who are ready to cultivate their ambition.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="mx-auto max-w-4xl px-4 md:px-8 py-12 md:py-20">

        {/* Our Values */}
        <section className="mb-12 rounded-2xl border border-border bg-card p-6 md:p-8">
          <h2 className="font-header text-2xl font-semibold text-foreground mb-6">Our Values</h2>
          <ul className="space-y-3 text-foreground">
            <li className="flex items-start gap-3">
              <span className="text-primary mt-1">•</span>
              <span>Open source everything</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary mt-1">•</span>
              <span>Maintain trust & Legitimacy</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary mt-1">•</span>
              <span>Knowledge sharing (Nothing paywalled for users, no gatekeeping)</span>
            </li>
          </ul>
        </section>

        {/* Why Section */}
        <section className="mb-12">
          <h2 className="font-header text-2xl font-semibold text-foreground mb-4">Why?</h2>
          <p className="text-foreground/90 mb-6 leading-relaxed">
            Companies feel they gain a significant competitive advantage from hiring cracked students from Canadian institutions, yet, competing for their attention and interest has historically been a difficult process.
          </p>
          <p className="text-foreground/90 mb-4 leading-relaxed">
            So, we&apos;re aiming to tackle it through 3 dimensions:
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            {["Events", "Jobs", "Culture & Community"].map((dimension) => (
              <div key={dimension} className="rounded-lg border border-border bg-card p-4 text-center">
                <span className="font-semibold text-foreground">{dimension}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Events Dimension */}
        <section className="mb-12 rounded-2xl border border-border bg-card p-6 md:p-8">
          <h2 className="font-header text-2xl font-semibold text-foreground mb-4">Events Dimension</h2>
          <p className="text-foreground/90 mb-4 leading-relaxed">
            We help companies connect with cracked Canadian youth through targeted event sponsorship.
          </p>

          <div className="space-y-4 mb-6">
            <div className="rounded-lg bg-muted/50 p-4">
              <p className="text-sm text-foreground/80 leading-relaxed">
                Companies like Shopify do an excellent job of marketing themselves to students by financially supporting events across campus. But, finding the right club to partner with, making sure that sponsorship money is well-used and outreach takes a considerable amount of time.
              </p>
            </div>

            <div className="rounded-lg bg-muted/50 p-4">
              <p className="text-sm text-foreground/80 leading-relaxed">
                Student-led organisations are under-funded and hungry for support and sponsorships. But, finding companies interested in partnering with them takes a considerable amount of time.
              </p>
            </div>
          </div>
        </section>

        {/* Jobs Dimension */}
        <section className="mb-12 rounded-2xl border border-border bg-card p-6 md:p-8">
          <h2 className="font-header text-2xl font-semibold text-foreground mb-4">Jobs Dimension</h2>
          <p className="text-foreground/90 leading-relaxed">
            We help companies connect with cracked Canadian youth through our forward-deployed job board.
          </p>
        </section>

        {/* Culture & Community Dimension */}
        <section className="mb-12 rounded-2xl border border-border bg-card p-6 md:p-8">
          <h2 className="font-header text-2xl font-semibold text-foreground mb-4">Culture & Community Dimension</h2>
          <p className="text-foreground/90 mb-4 leading-relaxed">
            We&apos;re going to become the space where Canadian Students in tech go to find jobs, opportunities, sponsorships and partnerships.
          </p>
          <p className="text-foreground/90 leading-relaxed">
            We&apos;re aiming to have a &quot;for students, by students&quot; type of vibe. It&apos;s important for us to show that as an organization, we&apos;re legit, here to spread good and dependable.
          </p>
        </section>

        {/* Our Messaging */}
        <section className="mb-12">
          <h2 className="font-header text-2xl font-semibold text-foreground mb-6">Our Messaging</h2>

          {/* For Companies */}
          <div className="mb-8 rounded-2xl border border-primary/20 bg-primary/5 p-6 md:p-8">
            <h3 className="font-semibold text-lg text-foreground mb-3">For Companies</h3>
            <div className="space-y-3 text-foreground/90">
              <p className="leading-relaxed">
                Want Waterloo interns? We&apos;re here to help you find them!
              </p>
              <p className="leading-relaxed">
                We&apos;re building an open source marketplace to help tech companies reach cracked students. Want in?
              </p>
              <p className="leading-relaxed">
                Sign up to <Link href="/" className="underline hover:text-primary">waterloo.works</Link>, post about yourselves, list your jobs and sponsor events to reach your next hire.
              </p>
            </div>
          </div>

          {/* For Students */}
          <div className="mb-8 rounded-2xl border border-border bg-card p-6 md:p-8">
            <h3 className="font-semibold text-lg text-foreground mb-3">For Students</h3>
            <p className="text-foreground/90 leading-relaxed">
              Waterloo students. If you&apos;re on a job hunt right now, we&apos;re building an open source marketplace to match you with hot tech companies. We&apos;re completely free, list exclusive jobs & update postings daily. We just launched so hop on before everyone knows about us ;)
            </p>
          </div>

          {/* For Event Hosts */}
          <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
            <h3 className="font-semibold text-lg text-foreground mb-3">For Event Hosts / Clubs</h3>
            <p className="text-foreground/90 mb-4 leading-relaxed">
              Want event funding? Post about your club and events on <Link href="/" className="underline hover:text-primary">waterloo.works</Link> and we&apos;ll help you connect with companies who want to work with you!
            </p>

            <div className="space-y-4 mt-6">
              <div>
                <h4 className="font-medium text-foreground mb-2">What do I have to do?</h4>
                <p className="text-sm text-foreground/80">Tell us about your club, the type of events you run and how many people show up and we&apos;ll work to match you with companies interested in sponsoring your events. (Free of charge).</p>
              </div>

              <div>
                <h4 className="font-medium text-foreground mb-2">How much funding will I get?</h4>
                <p className="text-sm text-foreground/80">It depends! It could be $ or an in-kind donation of food.</p>
              </div>

              <div>
                <h4 className="font-medium text-foreground mb-2">What do I have to do in return?</h4>
                <p className="text-sm text-foreground/80">It also depends. Usually companies will ask you to promote them in one way or another - this could mean thanking them during the event, posting on your social media or including their name on a banner.</p>
              </div>

              <div>
                <h4 className="font-medium text-foreground mb-2">Why would a company want to sponsor us?</h4>
                <p className="text-sm text-foreground/80">Companies want to increase the awareness of their brand on campuses! Usually, the companies we work with are hiring and want to make sure that students are aware of the awesome roles they have available!</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <div className="text-center rounded-2xl border border-primary bg-primary/5 p-8">
          <h2 className="font-header text-2xl font-semibold text-foreground mb-4">
            Ready to partner with us?
          </h2>
          <p className="text-foreground/90 mb-6">
            Let&apos;s work together to connect {companyName} with Canada&apos;s brightest tech talent.
          </p>
          <Link
            href="/post-job"
            className="inline-block rounded-full bg-primary text-primary-foreground px-8 py-3 text-lg font-medium shadow hover:bg-primary/90 transition-colors"
          >
            Get Started
          </Link>
        </div>
      </main>
    </div>
  );
}
