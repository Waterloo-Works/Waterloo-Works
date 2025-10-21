"use client";

import { useEffect, useState } from "react";
import { OnboardingTour } from "@/components/OnboardingTour";
import { useSession } from "@/providers/SessionProvider";
import { getCurrentUser } from "@/app/actions/auth";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

interface OnboardingWrapperProps {
	initialHasSource: boolean;
	children: React.ReactNode;
}

/**
 * OnboardingWrapper
 *
 * Manages the interactive onboarding tour for new users.
 *
 * DEV TESTING:
 * Add ?onboarding=forced to any URL to trigger the tour for testing
 * Example: http://localhost:3000/explore?onboarding=forced
 */
export function OnboardingWrapper({
    initialHasSource,
    children,
}: OnboardingWrapperProps) {
    const { user, loading } = useSession();
    const [hasSource, setHasSource] = useState(initialHasSource);
    // Avoid SSR/CSR markup mismatch by deferring modal rendering until mount
    const [mounted, setMounted] = useState(false);
    const sp = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

	// Check if current route is public (SEO pages) or should skip onboarding
    const isPublicRoute = pathname ? (
        pathname === '/' ||
        pathname === '/login' ||
        pathname === '/signup' ||
        pathname.startsWith('/auth/')
    ) : false;

    useEffect(() => {
        setMounted(true);

		// Fetch fresh user data when auth state changes
		const checkUserSource = async () => {
			if (!loading && user) {
				const dbUser = await getCurrentUser();
				const userHasSource = !!dbUser?.source;
				setHasSource(userHasSource);

				// Check if user dismissed tour before
				if (!userHasSource) {
					const tourDismissed = localStorage.getItem(`tour-dismissed-${user.id}`);
					if (tourDismissed) {
						setHasSource(true); // Don't show tour again if dismissed
					}
				}
			} else if (!loading && !user) {
				// User signed out, reset to initial state
				setHasSource(true);
			}
		};

		checkUserSource();
	}, [user, loading]);

	// DEV FEATURE FLAG: Force onboarding with ?onboarding=forced
	const forceOnboarding = sp?.get('onboarding') === 'forced';

	// Show tour if:
	// - Force flag is set (?onboarding=forced), OR
	// - User is logged in, doesn't have source, not on public route, and mounted
	const shouldShowTour = mounted && !loading && user && (
		forceOnboarding || (!hasSource && !isPublicRoute)
	);

    return (
        <>
            {children}
            {shouldShowTour && (
                <OnboardingTour
                    onCompleted={() => {
                        setHasSource(true);
                        // Remove onboarding parameter from URL if present
                        const newSearchParams = new URLSearchParams(sp?.toString());
                        newSearchParams.delete('onboarding');
                        const newUrl = newSearchParams.toString()
                            ? `${pathname}?${newSearchParams.toString()}`
                            : pathname;

                        // If forced, just remove the parameter but don't navigate away
                        if (forceOnboarding) {
                            router.replace(newUrl || pathname || '/explore');
                        } else {
                            router.replace(newUrl || pathname || '/explore');
                            router.refresh();
                        }
                    }}
                />
            )}
        </>
    );
}
