import { allBlogs } from "content-collections";
import Link from "next/link";
import { Metadata } from "next";
import { format } from "date-fns";
import { PageViewTracker } from "@/components/PageViewTracker";

export const dynamic = 'force-static';

export const metadata: Metadata = {
	title: "Blog | Waterloo App",
	description: "Articles, insights, and updates from Waterloo App",
};

export default function BlogIndexPage() {
	// Sort by most recent first
	const blogs = (allBlogs || []).sort(
		(a, b) =>
			new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
	);

	return (
		<div className="min-h-svh bg-white">
			<PageViewTracker pageType="blog_index" metadata={{ total_posts: blogs.length }} />
			<div className="mx-auto max-w-4xl px-6 py-12">
				<div className="mb-12">
					<h1 className="font-header text-4xl md:text-5xl font-semibold tracking-tight text-zinc-900 mb-4">
						Blog
					</h1>
					<p className="text-xl text-zinc-600">
						Articles, insights, and updates from the Waterloo App community
					</p>
				</div>

				<div className="space-y-12">
					{blogs.map((blog) => {
						return (
							<article
								key={blog.slug}
								className="group"
							>
								<Link
									href={`/blog/${blog.slug}`}
									className="block"
								>
									{blog.coverImage && (
										<div className="mb-4 overflow-hidden rounded-2xl">
											<img
												src={blog.coverImage}
												alt={blog.title}
												className="w-full aspect-[2/1] object-cover group-hover:scale-105 transition-transform duration-300"
											/>
										</div>
									)}
									<div className="space-y-3">
										{/* Tags */}
										{blog.tags && blog.tags.length > 0 && (
											<div className="flex flex-wrap gap-2">
												{blog.tags.map((tag) => (
													<span
														key={tag}
														className="px-3 py-1 text-xs font-medium rounded-full bg-zinc-100 text-zinc-700"
													>
														{tag}
													</span>
												))}
											</div>
										)}

										{/* Title */}
										<h2 className="font-header text-2xl md:text-3xl font-semibold text-zinc-900 group-hover:text-blue-600 transition-colors">
											{blog.title}
										</h2>

										{/* Excerpt */}
										{blog.excerpt && (
											<p className="text-lg text-zinc-600 line-clamp-3">
												{blog.excerpt}
											</p>
										)}

										{/* Metadata */}
										<div className="flex items-center gap-4 text-sm text-zinc-500">
											{blog.author && <span>{blog.author}</span>}
											<span>•</span>
											<time dateTime={blog.publishedAt}>
												{format(new Date(blog.publishedAt), "MMMM d, yyyy")}
											</time>
										</div>
									</div>
								</Link>
							</article>
						);
					})}
				</div>

				{blogs.length === 0 && (
					<div className="text-center py-24">
						<p className="text-xl text-zinc-500">
							No blog posts yet. Check back soon!
						</p>
					</div>
				)}
			</div>
		</div>
	);
}
