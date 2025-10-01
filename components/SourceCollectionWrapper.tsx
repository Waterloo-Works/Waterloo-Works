"use client";

import { useEffect, useState } from "react";
import { SourceCollectionModal } from "@/components/SourceCollectionModal";
import { useSession } from "@/providers/SessionProvider";
import { getCurrentUser } from "@/app/actions/auth";

interface SourceCollectionWrapperProps {
	initialHasSource: boolean;
	children: React.ReactNode;
}

export function SourceCollectionWrapper({
	initialHasSource,
	children,
}: SourceCollectionWrapperProps) {
	const { user, loading } = useSession();
	const [hasSource, setHasSource] = useState(initialHasSource);

	useEffect(() => {
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
	}, [user, loading]);

	// Don't show modal if user is not logged in or still loading
	const shouldShowModal = !loading && user && !hasSource;

	return (
		<>
			<SourceCollectionModal hasSource={!shouldShowModal} />
			{children}
		</>
	);
}
