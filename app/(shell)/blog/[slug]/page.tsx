import { allBlogs } from "content-collections";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import { format } from "date-fns";
import { PageViewTracker } from "@/components/PageViewTracker";

export const dynamic = 'force-static';

export async function generateStaticParams() {
	return allBlogs.map((blog) => ({
		slug: blog.slug,
	}));
}

export async function generateMetadata({
	params,
}: {
	params: Promise<{ slug: string }>;
}): Promise<Metadata> {
	const { slug } = await params;
	const blog = allBlogs.find((b) => b.slug === slug);

	if (!blog) {
		return {
			title: "Blog Post Not Found | Waterloo Works",
		};
	}

	return {
		title: `${blog.title} | Waterloo Works Blog`,
		description: blog.excerpt || `Read about ${blog.title} on Waterloo Works`,
	};
}

export default async function BlogPostPage({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const { slug } = await params;
	const blog = allBlogs.find((b) => b.slug === slug);

	if (!blog) {
		notFound();
	}

	// Find related blogs (same tags)
	const relatedBlogs = allBlogs
		.filter(
			(b) =>
				b.slug !== blog.slug &&
				b.tags.some((tag) => blog.tags.includes(tag))
		)
		.slice(0, 3);

	return (
		<div className="min-h-svh bg-white">
			<PageViewTracker
				pageType="blog"
				metadata={{
					blog_title: blog.title,
					author: blog.author,
					tags: blog.tags,
				}}
			/>
			<div className="mx-auto max-w-3xl px-6 py-12">
				{/* Breadcrumbs for SEO and navigation */}
				<nav className="mb-8 text-sm text-zinc-600" aria-label="Breadcrumb">
					<ol className="flex items-center space-x-2">
						<li>
							<Link href="/" className="hover:text-zinc-900">
								Home
							</Link>
						</li>
						<li>/</li>
						<li>
							<Link href="/blog" className="hover:text-zinc-900">
								Blog
							</Link>
						</li>
						<li>/</li>
						<li className="text-zinc-900 font-medium">{blog.title}</li>
					</ol>
				</nav>

				{/* Back link */}
				<Link
					href="/blog"
					className="inline-flex items-center text-zinc-600 hover:text-zinc-900 mb-8"
				>
					← Back to all articles
				</Link>

				{/* Blog header */}
				<article>
					<header className="mb-12">
						{/* Tags */}
						{blog.tags && blog.tags.length > 0 && (
							<div className="flex flex-wrap gap-2 mb-6">
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
						<h1 className="font-title text-3xl md:text-5xl font-semibold tracking-tight text-zinc-900 mb-6">
							{blog.title}
						</h1>

						{/* Metadata */}
						<div className="flex items-center gap-4 text-zinc-600 border-b border-zinc-200 pb-6">
							{blog.author && (
								<div className="flex items-center gap-2">
									<span className="font-medium">{blog.author}</span>
								</div>
							)}
							{blog.author && <span>•</span>}
							<time dateTime={blog.publishedAt}>
								{format(new Date(blog.publishedAt), "MMMM d, yyyy")}
							</time>
						</div>

						{/* Cover image */}
						{blog.coverImage && (
							<div className="mt-8 overflow-hidden rounded-2xl">
								<img
									src={blog.coverImage}
									alt={blog.title}
									className="w-full aspect-[2/1] object-cover"
								/>
							</div>
						)}
					</header>

					{/* Blog content */}
					<div
						className="prose prose-lg prose-zinc max-w-none"
						dangerouslySetInnerHTML={{ __html: blog.html }}
					/>
				</article>

				{/* Related blogs for internal linking */}
				{relatedBlogs.length > 0 && (
					<div className="mt-16 pt-12 border-t border-zinc-200">
						<h2 className="font-title text-2xl font-semibold text-zinc-900 mb-8">
							Related Articles
						</h2>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
							{relatedBlogs.map((relatedBlog) => (
								<Link
									key={relatedBlog.slug}
									href={`/blog/${relatedBlog.slug}`}
									className="group block rounded-xl border border-zinc-200 bg-white p-4 hover:shadow-md transition-shadow"
								>
									{relatedBlog.coverImage && (
										<div className="mb-3 overflow-hidden rounded-lg">
											<img
												src={relatedBlog.coverImage}
												alt={relatedBlog.title}
												className="w-full aspect-video object-cover group-hover:scale-105 transition-transform duration-300"
											/>
										</div>
									)}
									<h3 className="font-semibold text-zinc-900 group-hover:text-blue-600 transition-colors line-clamp-2">
										{relatedBlog.title}
									</h3>
									{relatedBlog.excerpt && (
										<p className="text-sm text-zinc-600 mt-2 line-clamp-2">
											{relatedBlog.excerpt}
										</p>
									)}
									<div className="text-xs text-zinc-500 mt-3">
										{format(new Date(relatedBlog.publishedAt), "MMM d, yyyy")}
									</div>
								</Link>
							))}
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
