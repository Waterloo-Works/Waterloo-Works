import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "**",
			},
			{
				protocol: "http",
				hostname: "**",
			},
		],
	},
	async rewrites() {
		return [
			// Preferred short path to bypass some blockers
			{
				source: "/ph/static/:path*",
				destination: "https://us-assets.i.posthog.com/static/:path*",
			},
			{
				source: "/ph/:path*",
				destination: "https://us.i.posthog.com/:path*",
			},
			{
				source: "/ingest/static/:path*",
				destination: "https://us-assets.i.posthog.com/static/:path*",
			},
			{
				source: "/ingest/:path*",
				destination: "https://us.i.posthog.com/:path*",
			},
		];
	},
	// This is required to support PostHog trailing slash API requests
	skipTrailingSlashRedirect: true,
  // Provide a stable alias to the pre-generated content collection bundle
  // to avoid running the builder in environments where it may fail
  // (e.g., limited CPUs or no DB connectivity during CI).
  webpack: (config) => {
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      'content-collections': path.resolve(process.cwd(), '.content-collections/generated/index.js'),
    };
    return config;
  },
};

export default nextConfig;
