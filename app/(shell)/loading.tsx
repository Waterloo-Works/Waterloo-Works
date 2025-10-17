import GridOverlay from "@/components/ui/GridOverlay";

export default function ShellLoading() {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-white">
      <GridOverlay
        className="z-10"
        fullHeight
        variant="sides"
        showTopTicks
        showBottomTicks
        showNodes
        showBottomNodes
        style={{ ['--ticks-top-offset' as any]: '8px', ['--hairline-top' as any]: '0px', ['--hairline-bottom' as any]: '8px' }}
      />

      {/* Minimal spinner */}
      <div className="relative z-20 flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-200 border-t-zinc-900" />
        <p className="text-sm text-zinc-600">Loading...</p>
      </div>
    </section>
  );
}
