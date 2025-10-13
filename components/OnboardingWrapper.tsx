"use client";

import { useEffect, useState } from "react";
import { OnboardingModal } from "@/components/OnboardingModal";
import { useSession } from "@/providers/SessionProvider";
import { getCurrentUser } from "@/app/actions/auth";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

interface OnboardingWrapperProps {
	initialHasSource: boolean;
	children: React.ReactNode;
}

export function OnboardingWrapper({
	initialHasSource,
	children,
}: OnboardingWrapperProps) {
	const { user, loading } = useSession();
	const [hasSource, setHasSource] = useState(initialHasSource);
	const sp = useSearchParams();
	const router = useRouter();
	const pathname = usePathname();

	// Check if current route is public (SEO pages)
	const isPublicRoute = pathname ? (
		pathname.startsWith('/jobs') ||
		pathname.startsWith('/companies') ||
		pathname.startsWith('/blog') ||
		pathname.startsWith('/resources') ||
		pathname === '/login' ||
		pathname === '/signup' ||
		pathname.startsWith('/auth/')
	) : false;

	useEffect(() => {
		// Skip onboarding check on public routes
		if (isPublicRoute) {
			return;
		}

		// Fetch fresh user data when auth state changes
		const checkUserSource = async () => {
			if (!loading && user) {
				const dbUser = await getCurrentUser();
				setHasSource(!!dbUser?.source);
			} else if (!loading && !user) {
				// User signed out, reset to initial state
				setHasSource(true);
			}
		};

		checkUserSource();
	}, [user, loading, isPublicRoute]);

	// Don't show modal on public routes or if user is not logged in or still loading
	const shouldShowModal = !isPublicRoute && !loading && user && !hasSource;

	return (
		<>
			<OnboardingModal
				hasSource={!shouldShowModal}
				onCompleted={() => {
					const next = sp?.get("next");
					if (next) router.push(next);
					else router.refresh();
				}}
			/>
			{children}
		</>
	);
}
