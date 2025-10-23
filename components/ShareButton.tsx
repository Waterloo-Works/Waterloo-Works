"use client";

import { useState } from "react";

export default function ShareButton({
	jobId,
	jobTitle,
}: {
	jobId: string;
	jobTitle: string;
}) {
	const [copied, setCopied] = useState(false);

	const handleShare = async () => {
		const url = `${window.location.origin}/jobs/${jobId}`;

		try {
			await navigator.clipboard.writeText(url);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch (err) {
			console.error("Failed to copy:", err);
		}
	};

	return (
		<button
			onClick={handleShare}
			className="px-4 py-2 border border-border rounded-full hover:bg-muted transition-colors flex items-center gap-2 text-sm text-foreground"
		>
			{copied ? (
				<>
					<svg
						className="w-4 h-4"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M5 13l4 4L19 7"
						/>
					</svg>
					Copied!
				</>
			) : (
				<>
					<svg
						className="w-4 h-4"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
						/>
					</svg>
					Share
				</>
			)}
		</button>
	);
}
