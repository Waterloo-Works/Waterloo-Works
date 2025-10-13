import Link from "next/link";

export default function Footer() {
	return (
		<footer className="border-t border-zinc-200 bg-white">
			<div className="mx-auto max-w-6xl px-6 py-12">
				<div className="grid grid-cols-2 gap-8 md:grid-cols-4">
					{/* Browse Section */}
					<div>
						<h3 className="mb-4 text-sm font-semibold text-zinc-900">Browse</h3>
						<ul className="space-y-3">
							<li>
								<Link
									href="/jobs"
									className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors"
								>
									Jobs
								</Link>
							</li>
							<li>
								<Link
									href="/companies"
									className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors"
								>
									Companies
								</Link>
							</li>
							<li>
								<Link
									href="/resources"
									className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors"
								>
									Resources
								</Link>
							</li>
						</ul>
					</div>

					{/* For Employers Section */}
					<div>
						<h3 className="mb-4 text-sm font-semibold text-zinc-900">For Employers</h3>
						<ul className="space-y-3">
							<li>
								<Link
									href="/post-job"
									className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors"
								>
									Post a Job
								</Link>
							</li>
							<li>
								<Link
									href="/explore"
									className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors"
								>
									Explore
								</Link>
							</li>
						</ul>
					</div>

					{/* For Students Section */}
					<div>
						<h3 className="mb-4 text-sm font-semibold text-zinc-900">For Students</h3>
						<ul className="space-y-3">
							<li>
								<Link
									href="/my-jobs"
									className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors"
								>
									My Jobs
								</Link>
							</li>
							<li>
								<Link
									href="/bookmarks"
									className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors"
								>
									Bookmarks
								</Link>
							</li>
							<li>
								<Link
									href="/inbox"
									className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors"
								>
									Inbox
								</Link>
							</li>
						</ul>
					</div>

					{/* Company Section */}
					<div>
						<h3 className="mb-4 text-sm font-semibold text-zinc-900">Company</h3>
						<ul className="space-y-3">
							<li>
								<Link
									href="https://waterloogroup.chat"
									target="_blank"
									rel="noopener noreferrer"
									className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors"
								>
									About
								</Link>
							</li>
							<li>
								<Link
									href="https://github.com/waterlooworks/waterloo-works"
									target="_blank"
									rel="noopener noreferrer"
									className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors"
								>
									GitHub
								</Link>
							</li>
						</ul>
					</div>
				</div>

				{/* Bottom Bar */}
				<div className="mt-12 border-t border-zinc-200 pt-8">
					<p className="text-center text-sm text-zinc-600">
						Made with 💦 by{" "}
						<Link
							href="https://waterloogroup.chat"
							target="_blank"
							rel="noopener noreferrer"
							className="text-zinc-900 underline hover:opacity-80"
						>
							waterloogroup.chat
						</Link>
					</p>
				</div>
			</div>
		</footer>
	);
}
