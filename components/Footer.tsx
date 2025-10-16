import Link from "next/link";

export default function Footer() {
	return (
		<footer className="border-t border-zinc-200 bg-white">
			<div className="mx-auto max-w-6xl px-6 py-12">
				<div className="grid grid-cols-2 gap-8 md:gap-16">
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

					{/* Legal Section */}
					<div>
						<h3 className="mb-4 text-sm font-semibold text-zinc-900">Legal</h3>
						<ul className="space-y-3">
							<li>
								<Link
									href="/terms"
									className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors"
								>
									Terms of Service
								</Link>
							</li>
							<li>
								<Link
									href="/privacy"
									className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors"
								>
									Privacy Policy
								</Link>
							</li>
						</ul>
					</div>
				</div>
			</div>
		</footer>
	);
}
