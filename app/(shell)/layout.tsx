import type { ReactNode } from "react";
import AppSidebar from "@/components/AppSidebar";
import HeaderMinimal from "@/components/HeaderMinimal";
import Footer from "@/components/Footer";

export default function ShellLayout({ children }: { children: ReactNode }) {
  return (
    <div className="shell-layout flex min-h-svh bg-white">
      <AppSidebar />
      <main className="flex-1 pt-14 lg:pt-0">
        <HeaderMinimal />
        {children}
        <Footer />
      </main>
    </div>
  );
}
