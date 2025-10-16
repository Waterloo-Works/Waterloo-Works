import { allResources } from "content-collections";
import Link from "next/link";
import { Metadata } from "next";
import { PageViewTracker } from "@/components/PageViewTracker";

export const dynamic = 'force-static';

export const metadata: Metadata = {
	title: "Resources | Waterloo Works",
	description: "Curated directory of useful tools, platforms, and resources for Waterloo students",
};

export default function ResourcesIndexPage() {
	// Sort by verified first, then by most recent
	const resources = (allResources || []).sort((a, b) => {
		if (a.verified !== b.verified) {
			return b.verified ? 1 : -1;
		}
		return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
	});

	// Group by category
	const byCategory = resources.reduce((acc, resource) => {
		if (!acc[resource.category]) {
			acc[resource.category] = [];
		}
		acc[resource.category].push(resource);
		return acc;
	}, {} as Record<string, typeof resources>);

	const categories = Object.keys(byCategory).sort();

	return (
		<div className="min-h-svh bg-white">
			<PageViewTracker pageType="resources_index" metadata={{ total_resources: resources.length, total_categories: categories.length }} />
			<div className="mx-auto max-w-6xl px-6 py-12">
				{/* Header */}
				<div className="mb-12">
					<h1 className="font-title text-4xl md:text-5xl font-semibold tracking-tight text-zinc-900 mb-4">
						Resource Directory
					</h1>
					<p className="text-xl text-zinc-600">
						Curated collection of useful tools, platforms, and resources for Waterloo students
					</p>
				</div>

				{/* Categories */}
				{categories.map((category) => (
					<div key={category} className="mb-12">
						<h2 className="font-title text-2xl font-semibold text-zinc-900 mb-6 border-b border-zinc-200 pb-2">
							{category}
						</h2>

						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							{byCategory[category].map((resource) => (
								<Link
									key={resource.slug}
									href={`/resources/${resource.slug}`}
									className="group block rounded-2xl border border-zinc-200 bg-white p-6 hover:shadow-lg transition-all hover:border-zinc-300"
								>
									<div className="flex items-start gap-4">
										{resource.logo && (
											<img
												src={resource.logo}
												alt={`${resource.name} logo`}
												className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
											/>
										)}
										<div className="flex-1 min-w-0">
											<div className="flex items-start justify-between gap-2 mb-2">
												<h3 className="text-lg font-semibold text-zinc-900 group-hover:text-blue-600 transition-colors">
													{resource.name}
													{resource.verified && (
														<span className="ml-2 text-xs text-green-600">✓</span>
													)}
												</h3>
											</div>
											<p className="text-sm text-zinc-600 line-clamp-2 mb-3">
												{resource.description}
											</p>
											<div className="flex flex-wrap gap-2">
												{resource.tags.slice(0, 3).map((tag) => (
													<span
														key={tag}
														className="px-2 py-1 text-xs font-medium rounded-full bg-zinc-100 text-zinc-700"
													>
														{tag}
													</span>
												))}
											</div>
										</div>
									</div>
								</Link>
							))}
						</div>
					</div>
				))}

				{resources.length === 0 && (
					<div className="text-center py-24">
						<p className="text-xl text-zinc-500">
							No resources available yet. Check back soon!
						</p>
					</div>
				)}
			</div>
		</div>
	);
}
