import type { ReactNode } from "react";
import AppSidebar from "@/components/AppSidebar";
import HeaderDesktop from "@/components/HeaderDesktop";
import HeaderMobile from "@/components/HeaderMobile";
import Footer from "@/components/Footer";

export default function ShellLayout({ children }: { children: ReactNode }) {
  return (
    <div className="shell-layout flex min-h-svh bg-white">
      <AppSidebar />
      <main className="flex-1 pt-14 md:pt-0">
        {/* Mutually exclusive headers */}
        <HeaderMobile />
        <HeaderDesktop />
        {children}
        {/* Consolidated site footer for shell pages */}
        <Footer />
      </main>
    </div>
  );
}
