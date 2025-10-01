"use client";

import { useSession } from "@/providers/SessionProvider";
import Link from "next/link";

export default function Home() {
	const { user, loading } = useSession();

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-[#F5F1E8]">
				<div className="text-gray-500">Loading...</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-[#F5F1E8]">
			{/* Navigation */}
			<nav className="px-6 py-6">
				<div className="max-w-6xl mx-auto flex justify-between items-center">
					<Link href="/" className="text-xl font-serif italic text-black">
						Waterloo.works
					</Link>
					{user && (
						<div className="flex items-center gap-6">
							<Link
								href="/jobs"
								className="text-black hover:opacity-70 transition-opacity"
							>
								Browse Jobs
							</Link>
							<Link
								href="/dashboard"
								className="px-5 py-2.5 bg-black text-[#F5F1E8] rounded-full hover:bg-gray-800 transition-colors"
							>
								Dashboard
							</Link>
						</div>
					)}
				</div>
			</nav>

			{/* Hero Section */}
			<main className="max-w-4xl mx-auto px-6">
				<div className="pt-16 pb-12 md:pt-24 md:pb-16">
					<h1 className="text-5xl md:text-7xl lg:text-8xl font-serif italic leading-tight text-black mb-8">
						Waterloo.works
					</h1>
					<div className="text-xl md:text-2xl leading-relaxed max-w-2xl">
						<p className="mb-4">
							A community job board meant to connect the best{" "}
							<span className="italic">talent</span> with the best{" "}
							<span className="italic">opportunities</span>.
						</p>
					</div>
					<div className="mt-10 flex flex-wrap gap-4">
						<Link
							href={user ? "/jobs" : "/signup"}
							className="inline-flex items-center gap-2 px-6 py-3 bg-black text-[#F5F1E8] rounded-full hover:bg-gray-800 transition-colors"
						>
							<span>↗</span>
							<span>Explore Jobs</span>
						</Link>
					</div>
				</div>

				{/* About Section */}
				<div className="py-20 border-t border-black/10">
					<div className="max-w-3xl mx-auto">
						<p className="text-sm uppercase tracking-wider text-gray-500 mb-6">
							About the platform
						</p>
						<h2 className="text-3xl md:text-5xl font-serif leading-tight mb-8">
							A place where you can{" "}
							<span className="italic">find opportunities</span> for
							yourself{" "}
							<span className="inline-block w-3 h-3 bg-[#E8B45C] rounded-full align-middle mx-1"></span>{" "}
							<span className="italic">or</span> share them with others.
						</h2>
						<p className="text-lg md:text-xl text-gray-700 leading-relaxed">
							Waterloo.works is a community-driven job platform where anyone
							can post opportunities, apply for themselves, or forward jobs
							to help others in their network find meaningful work.
						</p>
					</div>
				</div>

				{/* How It Works */}
				<div className="py-20 border-t border-black/10">
					<h2 className="text-3xl md:text-4xl font-serif mb-12 text-center">
						How it works
					</h2>
					<div className="grid md:grid-cols-3 gap-8 md:gap-12">
						<div className="text-center">
							<div className="inline-block w-12 h-12 bg-[#F4C7D4] rounded-full mb-4"></div>
							<h3 className="text-xl font-serif mb-3">Discover</h3>
							<p className="text-gray-700">
								Browse opportunities shared by our community of students,
								alumni, and professionals.
							</p>
						</div>
						<div className="text-center">
							<div className="inline-block w-12 h-12 bg-[#A8D8B9] rounded-full mb-4"></div>
							<h3 className="text-xl font-serif mb-3">Apply</h3>
							<p className="text-gray-700">
								Find roles that match your interests and apply directly
								through the platform.
							</p>
						</div>
						<div className="text-center">
							<div className="inline-block w-12 h-12 bg-[#B4A5E8] rounded-full mb-4"></div>
							<h3 className="text-xl font-serif mb-3">Share</h3>
							<p className="text-gray-700">
								Help others by forwarding opportunities to friends,
								classmates, or anyone who might benefit.
							</p>
						</div>
					</div>
				</div>

				{/* CTA Section */}
				<div className="py-20 text-center">
					<h3 className="text-3xl md:text-4xl font-serif mb-6">
						Ready to explore?
					</h3>
					<p className="text-lg md:text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
						Join our community and discover opportunities that resonate with
						you.
					</p>
					<Link
						href={user ? "/jobs" : "/signup"}
						className="inline-flex items-center gap-2 px-8 py-4 bg-black text-[#F5F1E8] rounded-full hover:bg-gray-800 transition-colors text-lg"
					>
						<span>↗</span>
						<span>{user ? "Browse Jobs" : "Get Started"}</span>
					</Link>
				</div>
			</main>
		</div>
	);
}
