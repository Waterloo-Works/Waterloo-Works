import type { ReactNode } from "react";
import AppSidebar from "@/components/AppSidebar";
import HeaderDesktop from "@/components/HeaderDesktop";
import HeaderMobile from "@/components/HeaderMobile";
import Footer from "@/components/Footer";
import GridOverlay from "@/components/ui/GridOverlay";

export default function ShellLayout({ children }: { children: ReactNode }) {
  return (
    <div className="shell-layout flex min-h-svh bg-white">
      <AppSidebar />
      <main className="relative flex flex-1 flex-col">
        {/* Mutually exclusive headers */}
        <div className="pt-14 md:pt-0">
          <HeaderMobile />
          <HeaderDesktop />
        </div>
        {/* Side rails at container edges for layout separation */}
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
        <div className="flex-1">{children}</div>
        {/* Consolidated site footer for shell pages */}
        <Footer />
      </main>
    </div>
  );
}
