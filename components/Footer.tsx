import Link from "next/link";

export default function Footer() {
	return (
		<footer className="border-t border-black/10 bg-[#F5F1E8]">
			<div className="max-w-6xl mx-auto px-6 py-8">
				<p className="text-center text-sm text-gray-700">
					Made with ❤️ by{" "}
					<Link
						href="https://twitter.com/mayankja1n"
						target="_blank"
						rel="noopener noreferrer"
						className="text-black hover:opacity-70 transition-opacity underline"
					>
						Mayank
					</Link>{" "}
					and{" "}
					<Link
						href="https://x.com/onlychans1"
						target="_blank"
						rel="noopener noreferrer"
						className="text-black hover:opacity-70 transition-opacity underline"
					>
						Eden
					</Link>
				</p>
			</div>
		</footer>
	);
}
