import { allResources } from "content-collections";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import { PageViewTracker } from "@/components/PageViewTracker";

export const dynamic = 'force-static';

export async function generateStaticParams() {
	return allResources.map((resource) => ({
		slug: resource.slug,
	}));
}

export async function generateMetadata({
	params,
}: {
	params: Promise<{ slug: string }>;
}): Promise<Metadata> {
	const { slug } = await params;
	const resource = allResources.find((r) => r.slug === slug);

	if (!resource) {
		return {
			title: "Resource Not Found | Waterloo Works",
		};
	}

	return {
		title: `${resource.name} | Waterloo Works Resources`,
		description: resource.description,
	};
}

export default async function ResourcePage({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const { slug } = await params;
	const resource = allResources.find((r) => r.slug === slug);

	if (!resource) {
		notFound();
	}

	// Find related resources (same category)
	const relatedResources = allResources
		.filter(
			(r) =>
				r.slug !== resource.slug &&
				r.category === resource.category
		)
		.slice(0, 3);

	return (
		<div className="min-h-svh bg-white">
			<PageViewTracker
				pageType="resource"
				metadata={{
					resource_name: resource.name,
					category: resource.category,
					verified: resource.verified,
				}}
			/>
			<div className="mx-auto max-w-3xl px-6 py-12">
				{/* Breadcrumbs */}
				<nav className="mb-8 text-sm text-zinc-600" aria-label="Breadcrumb">
					<ol className="flex items-center space-x-2">
						<li>
							<Link href="/" className="hover:text-zinc-900">
								Home
							</Link>
						</li>
						<li>/</li>
						<li>
							<Link href="/resources" className="hover:text-zinc-900">
								Resources
							</Link>
						</li>
						<li>/</li>
						<li className="text-zinc-900 font-medium">{resource.name}</li>
					</ol>
				</nav>

				{/* Back link */}
				<Link
					href="/resources"
					className="inline-flex items-center text-zinc-600 hover:text-zinc-900 mb-8"
				>
					← Back to all resources
				</Link>

				{/* Resource header */}
				<div className="mb-8">
					<div className="flex items-start gap-4 mb-4">
						{resource.logo && (
							<img
								src={resource.logo}
								alt={`${resource.name} logo`}
								className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
							/>
						)}
						<div className="flex-1">
							<div className="flex items-center gap-2 mb-2">
								<h1 className="font-title text-3xl md:text-4xl font-semibold tracking-tight text-zinc-900">
									{resource.name}
								</h1>
								{resource.verified && (
									<span className="text-green-600 text-sm font-medium">
										✓ Verified
									</span>
								)}
							</div>
							<p className="text-zinc-600 mb-3">{resource.category}</p>
							<a
								href={resource.url}
								target="_blank"
								rel="noopener noreferrer"
								className="inline-flex items-center text-blue-600 hover:underline"
							>
								Visit {resource.name} →
							</a>
						</div>
					</div>

					{/* Tags */}
					{resource.tags && resource.tags.length > 0 && (
						<div className="flex flex-wrap gap-2 mt-4">
							{resource.tags.map((tag) => (
								<span
									key={tag}
									className="px-3 py-1 text-sm font-medium rounded-full bg-zinc-100 text-zinc-700"
								>
									{tag}
								</span>
							))}
						</div>
					)}
				</div>

				{/* Resource content */}
				<article
					className="prose prose-zinc max-w-none"
					dangerouslySetInnerHTML={{ __html: resource.html }}
				/>

				{/* Related resources */}
				{relatedResources.length > 0 && (
					<div className="mt-12 pt-8 border-t border-zinc-200">
						<h2 className="font-title text-2xl font-semibold text-zinc-900 mb-6">
							More in {resource.category}
						</h2>
						<div className="space-y-4">
							{relatedResources.map((relatedResource) => (
								<Link
									key={relatedResource.slug}
									href={`/resources/${relatedResource.slug}`}
									className="block rounded-xl border border-zinc-200 bg-white p-4 hover:shadow-md transition-shadow"
								>
									<div className="flex items-start gap-4">
										{relatedResource.logo && (
											<img
												src={relatedResource.logo}
												alt={`${relatedResource.name} logo`}
												className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
											/>
										)}
										<div className="flex-1">
											<h3 className="text-lg font-semibold text-zinc-900">
												{relatedResource.name}
												{relatedResource.verified && (
													<span className="ml-2 text-xs text-green-600">✓</span>
												)}
											</h3>
											<p className="text-sm text-zinc-600 mt-1 line-clamp-2">
												{relatedResource.description}
											</p>
										</div>
									</div>
								</Link>
							))}
						</div>
					</div>
				)}

				{/* CTA */}
				<div className="mt-12 pt-8 border-t border-zinc-200 text-center">
					<a
						href={resource.url}
						target="_blank"
						rel="noopener noreferrer"
						className="inline-flex items-center justify-center rounded-full bg-zinc-900 px-8 py-3 text-white hover:bg-zinc-800 transition-colors"
					>
						Visit {resource.name}
					</a>
				</div>
			</div>
		</div>
	);
}
