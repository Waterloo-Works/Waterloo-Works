import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/providers/SessionProvider";
import { SourceCollectionWrapper } from "@/components/SourceCollectionWrapper";
import { getCurrentUser } from "@/app/actions/auth";
import Footer from "@/components/Footer";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "Waterloo Works",
	description: "A community job board connecting talent with opportunities",
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
			<body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
				<SessionProvider>
					<SourceCollectionWrapper initialHasSource={hasSource}>
						{children}
						<Footer />
					</SourceCollectionWrapper>
				</SessionProvider>
			</body>
		</html>
	);
}
