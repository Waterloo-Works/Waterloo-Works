import type { Metadata } from "next";
import "./globals.css";
import { SessionProvider } from "@/providers/SessionProvider";
import { OnboardingWrapper } from "@/components/OnboardingWrapper";
import { getCurrentUser } from "@/app/actions/auth";
import { Toaster as SonnerToaster } from "sonner";
import QueryProvider from "@/providers/QueryProvider";
import { PostHogProvider } from "@/providers/PostHogProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { Suspense } from "react";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.NODE_ENV === "production" ? "https://waterloo.app" : "http://localhost:3000");

export const metadata: Metadata = {
    metadataBase: new URL(siteUrl),
    title: "Waterloo App",
    description: "A community job board connecting talent with opportunities",
    verification: {
        google: "-inMpqiJtUoevrzVB5Sq7cLyf4JyhhiyrN2js8Foy6M",
    },
    openGraph: {
        title: "Waterloo App",
        description: "A community job board connecting talent with opportunities",
        url: siteUrl,
        siteName: "Waterloo App",
        images: [
            {
                url: `${siteUrl}/og-image.png`,
                width: 1200,
                height: 630,
                alt: "waterloo.app — independent community job board",
            },
        ],
        locale: "en_US",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Waterloo App",
        description: "A community job board connecting talent with opportunities",
        images: [`${siteUrl}/og-image.png`],
    },
};

// Ensure consistent viewport behavior across Safari/iOS
export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover" as const,
};

// We read cookies in server components (Supabase session),
// so mark the app as dynamic to avoid static prerender errors.
export const dynamic = "force-dynamic";

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const user = await getCurrentUser();
	const hasSource = !!user?.source;

	return (
    <html lang="en" suppressHydrationWarning>
            <body className={`antialiased font-body tracking-wide-01 leading-body`}>
              <ThemeProvider>
                <PostHogProvider>
                  <SessionProvider>
                    <Suspense fallback={null}>
                      <OnboardingWrapper initialHasSource={hasSource}>
                        <QueryProvider>
                          {children}
                        </QueryProvider>
                        <SonnerToaster richColors closeButton position="top-right" />
                      </OnboardingWrapper>
                    </Suspense>
                  </SessionProvider>
                </PostHogProvider>
              </ThemeProvider>
            </body>
    </html>
	);
}
