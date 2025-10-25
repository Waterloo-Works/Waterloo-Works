import Link from "next/link";

interface EmptyStateProps {
	title?: string;
	message?: string;
	showFeedback?: boolean;
}

export default function EmptyState({
	title = "No results found",
	message = "Try adjusting your filters or search terms.",
	showFeedback = true,
}: EmptyStateProps) {
	return (
		<div className="flex flex-col items-center justify-center py-16 px-6 text-center">
			<div className="mb-4 text-6xl">🔍</div>
			<h3 className="font-header text-xl font-semibold text-zinc-900 dark:text-white mb-2">
				{title}
			</h3>
			<p className="font-body text-zinc-600 dark:text-zinc-400 mb-6 max-w-md">
				{message}
			</p>
			{showFeedback && (
				<div className="mt-4">
					<p className="font-body text-sm text-zinc-600 dark:text-zinc-400 mb-3">
						Not what you&apos;re looking for?
					</p>
					<Link
						href="/post-job"
						className="inline-flex items-center gap-2 rounded-full bg-zinc-900 dark:bg-zinc-700 px-6 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 transition-colors"
					>
						Let us know!
					</Link>
				</div>
			)}
		</div>
	);
}
