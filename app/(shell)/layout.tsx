import type { ReactNode } from "react";
import AppSidebar from "@/components/AppSidebar";
import HeaderDesktop from "@/components/HeaderDesktop";
import HeaderMobile from "@/components/HeaderMobile";
import GridOverlay from "@/components/ui/GridOverlay";
import FloatingProfileMenu from "@/components/FloatingProfileMenu";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/utils/prisma";

export default async function ShellLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  let isAdmin = false;
  if (user) {
    const record = await prisma.user.findUnique({ where: { id: user.id } });
    isAdmin = !!record?.isAdmin;
  }

  return (
    <div className="shell-layout flex min-h-svh bg-white">
      <AppSidebar />
      <main className="relative flex flex-1 flex-col">
        {/* Mutually exclusive headers */}
        <div className="pt-14 md:pt-0">
          <HeaderMobile />
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
      </main>
    </div>
  );
}
