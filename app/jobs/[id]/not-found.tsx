import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function NotFound() {
	return (
		<div className="min-h-screen bg-[#F5F1E8]">
			<Navbar />

			<main className="max-w-4xl mx-auto px-6 py-12">
				<div className="text-center py-20">
					<div className="inline-block w-16 h-16 bg-gray-200 rounded-full mb-4"></div>
					<h1 className="text-4xl font-serif italic mb-4 text-black">
						Job Not Found
					</h1>
					<p className="text-lg text-gray-700 mb-8">
						This job listing doesn&apos;t exist or is no longer available.
					</p>
					<Link
						href="/jobs"
						className="inline-block px-6 py-3 bg-black text-[#F5F1E8] rounded-full hover:bg-gray-800 transition-colors"
					>
						Browse All Jobs
					</Link>
				</div>
			</main>
		</div>
	);
}
