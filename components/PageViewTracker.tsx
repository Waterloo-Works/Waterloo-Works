"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import posthog from "posthog-js";

interface PageViewTrackerProps {
	pageType: "job" | "company" | "blog" | "resource" | "jobs_index" | "companies_index" | "blog_index" | "resources_index";
	metadata?: Record<string, string | number | string[] | boolean | null | undefined>;
}

export function PageViewTracker({ pageType, metadata }: PageViewTrackerProps) {
	const pathname = usePathname();
	const searchParams = useSearchParams();

	useEffect(() => {
		if (pathname) {
			const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "");

			// Track pageview with metadata
			posthog.capture("$pageview", {
				$current_url: url,
				page_type: pageType,
				...metadata,
			});
		}
	}, [pathname, searchParams, pageType, metadata]);

	return null;
}
