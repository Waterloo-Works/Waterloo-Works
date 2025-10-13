import type { Metadata } from "next";
import { Geist, Geist_Mono, Merriweather, Source_Sans_3 } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/providers/SessionProvider";
import { SourceCollectionWrapper } from "@/components/SourceCollectionWrapper";
import { getCurrentUser } from "@/app/actions/auth";
import { Toaster as SonnerToaster } from "sonner";
import QueryProvider from "@/providers/QueryProvider";
import { PostHogProvider } from "@/providers/PostHogProvider";
import { Suspense } from "react";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

// Curius-inspired typography
const titleSerif = Merriweather({
    variable: "--font-title-serif",
    weight: ["400", "700"],
    subsets: ["latin"],
    display: "swap",
});

const bodySans = Source_Sans_3({
    variable: "--font-body-sans",
    subsets: ["latin"],
    display: "swap",
});

export const metadata: Metadata = {
    title: "Waterloo Works",
    description: "A community job board connecting talent with opportunities",
};

// Ensure consistent viewport behavior across Safari/iOS
export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover" as const,
};

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const user = await getCurrentUser();
	const hasSource = !!user?.source;

	return (
    <html lang="en">
            <body className={`${geistSans.variable} ${geistMono.variable} ${titleSerif.variable} ${bodySans.variable} antialiased`}>
              <PostHogProvider>
                <SessionProvider>
					<Suspense fallback={null}>
						<SourceCollectionWrapper initialHasSource={hasSource}>
							<QueryProvider>
								{children}
							</QueryProvider>
							<SonnerToaster richColors closeButton position="top-right" />
						</SourceCollectionWrapper>
					</Suspense>
                </SessionProvider>
              </PostHogProvider>
            </body>
    </html>
	);
}